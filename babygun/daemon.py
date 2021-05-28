import os
import argparse
import pickle
from tqdm import tqdm
import PIL.Image
from PIL import ImageFilter
import numpy as np
import dnnlib
import dnnlib.tflib as tflib
import config
from encoder.generator_model import Generator
from encoder.perceptual_model import PerceptualModel, load_images
from keras.models import load_model
from keras.applications.resnet50 import preprocess_input
import logging
from dataclasses import dataclass
import tensorflow as tf
import sys
import time
import logging
from watchdog.observers import Observer
from watchdog.events import LoggingEventHandler, FileSystemEventHandler, FileCreatedEvent

def split_to_batches(l, n):
    for i in range(0, len(l), n):
        yield l[i:i + n]

def str2bool(v):
    if isinstance(v, bool):
       return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')

class BabyganHandler(FileSystemEventHandler):
  def on_created(self, event):
    if isinstance(event, FileCreatedEvent):
      print(f'File created at {event.src_path}')

      with open(event.src_path, 'r') as f:
        folder_name = f.read().strip()
      print(f'Would work in {folder_name}')

      predict(folder_name)

      with open(folder_name + "/done.txt", 'w') as f:
        f.write("Done")
        
      print('Done')
      
@dataclass
class Config:
  model_url = 'karras2019stylegan-ffhq-1024x1024.pkl'
  architecture = 'vgg16_zhang_perceptual.pkl'
  model_res = 1024
  batch_size = 2
  optimizer = 'ggt'
  data_dir = 'data'
  mask_dir = 'masks'

  image_size = 256
  resnet_image_size = 256
  lr = 0.25
  decay_rate = 0.9
  iterations = 12
  decay_steps = 4
  early_stopping = False
  load_effnet = 'data/finetuned_effnet.h5'
  load_resnet = 'data/finetuned_resnet.h5'
  use_preprocess_input = True
  use_best_loss = True
  average_best_loss = 0.25
  sharpen_input = True

  use_vgg_loss=0.4
  use_vgg_layer=9
  use_pixel_loss=1.5
  use_mssim_loss=200
  use_lpips_loss=100
  use_l1_penalty=0.5
  use_discriminator_loss=0.5
  use_adaptive_loss = False

  randomize_noise = False
  tile_dlatents = False
  clipping_threshold = 2.0

  load_mask = False
  face_mask = True
  use_grabcut = True
  scale_mask = 1.4
  composite_mask = True
  composite_blur = 8

  output_video = False

  decay_steps = 0.01 * 12

model_config = Config()

perceptual_model = None
ff_model = None
generator = None
discriminator_network = None
perc_model = None


def validate_app_context():
  global perceptual_model
  global ff_model
  global generator
  global discriminator_network
  global perc_model
  if perceptual_model is None:
    os.makedirs(model_config.data_dir, exist_ok=True)
    os.makedirs(model_config.mask_dir, exist_ok=True)

    # Initialize generator and perceptual model
    tflib.init_tf()
    with dnnlib.util.open_url(model_config.model_url, cache_dir=config.cache_dir) as f:
        generator_network, discriminator_network, Gs_network = pickle.load(f)
    generator = Generator(Gs_network, model_config.batch_size, clipping_threshold=model_config.clipping_threshold, tiled_dlatent=model_config.tile_dlatents, model_res=model_config.model_res, randomize_noise=model_config.randomize_noise)

    if (model_config.use_lpips_loss > 0.00000001):
        with dnnlib.util.open_url(model_config.architecture, cache_dir=config.cache_dir) as f:
            perc_model =  pickle.load(f)
    perceptual_model = PerceptualModel(model_config, perc_model=perc_model, batch_size=model_config.batch_size)
    perceptual_model.build_perceptual_model(generator, discriminator_network)

    print("Loading ResNet Model:")
    ff_model = load_model(model_config.load_resnet)
    
    logging.info("Model loaded")


def predict(root_folder):
  logging.info("Running PREDICT")
  validate_app_context()
  logging.info("App context ready")

  src_dir = root_folder + "/aligned_images"
  generated_images_dir = root_folder + "/generated_images"
  dlatent_dir = root_folder + "/latent_representations"

  ref_images = [os.path.join(src_dir, x) for x in os.listdir(src_dir)]
  ref_images = list(filter(os.path.isfile, ref_images))

  if len(ref_images) == 0:
      raise Exception('%s is empty' % args.src_dir)

  os.makedirs(generated_images_dir, exist_ok=True)
  os.makedirs(dlatent_dir, exist_ok=True)

  # Optimize (only) dlatents by minimizing perceptual loss between reference and generated images in feature space
  for images_batch in tqdm(split_to_batches(ref_images, model_config.batch_size), total=len(ref_images)//model_config.batch_size):
      names = [os.path.splitext(os.path.basename(x))[0] for x in images_batch]

      perceptual_model.set_reference_images(images_batch)
      dlatents = ff_model.predict(preprocess_input(load_images(images_batch,image_size=model_config.resnet_image_size)))
      generator.set_dlatents(dlatents)

      op = perceptual_model.optimize(generator.dlatent_variable, iterations=model_config.iterations, use_optimizer=model_config.optimizer)
      pbar = tqdm(op, leave=False, total=model_config.iterations)
      vid_count = 0
      best_loss = None
      best_dlatent = None
      avg_loss_count = 0
      for loss_dict in pbar:
          pbar.set_description(" ".join(names) + ": " + "; ".join(["{} {:.4f}".format(k, v) for k, v in loss_dict.items()]))
          if best_loss is None or loss_dict["loss"] < best_loss:
              if best_dlatent is None or model_config.average_best_loss <= 0.00000001:
                  best_dlatent = generator.get_dlatents()
              else:
                  best_dlatent = 0.25 * best_dlatent + 0.75 * generator.get_dlatents()
              if model_config.use_best_loss:
                  generator.set_dlatents(best_dlatent)
              best_loss = loss_dict["loss"]
          generator.stochastic_clip_dlatents()
          prev_loss = loss_dict["loss"]
      if not model_config.use_best_loss:
          best_loss = prev_loss
      print(" ".join(names), " Loss {:.4f}".format(best_loss))


      # Generate images from found dlatents and save them
      if model_config.use_best_loss:
          generator.set_dlatents(best_dlatent)
      generated_images = generator.generate_images()
      generated_dlatents = generator.get_dlatents()
      for img_array, dlatent, img_path, img_name in zip(generated_images, generated_dlatents, images_batch, names):
          mask_img = None
          if model_config.composite_mask and model_config.face_mask:
              _, im_name = os.path.split(img_path)
              mask_img = os.path.join(model_config.mask_dir, f'{im_name}')
          if model_config.composite_mask and mask_img is not None and os.path.isfile(mask_img):
              orig_img = PIL.Image.open(img_path).convert('RGB')
              width, height = orig_img.size
              imask = PIL.Image.open(mask_img).convert('L').resize((width, height))
              imask = imask.filter(ImageFilter.GaussianBlur(model_config.composite_blur))
              mask = np.array(imask)/255
              mask = np.expand_dims(mask,axis=-1)
              img_array = mask*np.array(img_array) + (1.0-mask)*np.array(orig_img)
              img_array = img_array.astype(np.uint8)
              img_array = np.where(mask, np.array(img_array), orig_img)
          img = PIL.Image.fromarray(img_array, 'RGB')
          img.save(os.path.join(generated_images_dir, f'{img_name}.png'), 'PNG')
          np.save(os.path.join(dlatent_dir, f'{img_name}.npy'), dlatent)

      generator.reset_dlatents()

  return f"Stored images in {generated_images_dir}"


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s - %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S')
    path = sys.argv[1] if len(sys.argv) > 1 else '/opt/savefolder/process/'
    # event_handler = LoggingEventHandler()
    event_handler = BabyganHandler()
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()