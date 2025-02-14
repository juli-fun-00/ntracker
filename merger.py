import cv2
import os
import utils
import argparse
import numpy as np
import requests
import time

def merge(a, b, babygun_path, savefolder, uuid):
    # return a
    merge_folder = savefolder + os.sep + uuid

    necessary_folders = ['raw_images', 'aligned_images', 'generated_images', 'latent_representations']
    for folder in necessary_folders:
        utils.local_mkdir(merge_folder + os.sep + folder)

    print("Writing a and b pictures...")
    cv2.imwrite(f'{merge_folder}/raw_images/a.jpg', a)
    cv2.imwrite(f'{merge_folder}/raw_images/b.jpg', b)

    print("executing align...")
    start_align = time.time()
    command_align = f"python align_images.py {merge_folder}/raw_images/ {merge_folder}/aligned_images/"
    utils.execute(command=command_align, workdir=babygun_path)
    align_took = time.time() - start_align
    print(f'align took {align_took} seconds')

    print("executing merge...")
    start_merge = time.time()
    r = requests.get(f"http://babygan:9080{merge_folder}")
    print(r.text)
    merge_took = time.time() - start_merge
    print(f'merge took {merge_took} seconds')

    result_name = np.random.choice(["a", "b"])

    orig_file_path = f'{merge_folder}/generated_images/{result_name}_01.png'
    jpg_file_path = orig_file_path.replace('.png', '.jpg')
    command_convert = f"/usr/bin/convert {orig_file_path} {jpg_file_path}"
    print("executing convert...")
    utils.execute(command=command_convert, workdir=babygun_path)

    result = cv2.imread(jpg_file_path)
    return result


# for testing purposes
if __name__ == "__main__":
    print("Merging main test started")
    parser = argparse.ArgumentParser()
    parser.add_argument("--BABYGUN_FOLDER", default="babygun", type=str,
                        help="token to work with yadisk")
    args = parser.parse_args()

    # BABYGUN= "/home/alex/PycharmProjects/ntracker/babygun"
    BABYGUN = args.BABYGUN_FOLDER

    test_prefix = '/opt/savefolder/test_images/'
    a_img = cv2.imread(test_prefix + "a.jpeg")
    b_img = cv2.imread(test_prefix + "b.jpeg")
    result = merge(a_img, b_img, BABYGUN, '/opt/savefolder', "test_uuid")
    if result is not None:
        cv2.imwrite(test_prefix + "result.png", result)
    else:
        print("NOT CORRECT picture received from merge")
    print("Done, saved")
