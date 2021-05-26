import cv2
import os
import utils
import argparse
import numpy as np


def merge(a, b, babygun_path, savefolder, uuid):
    # return a
    merge_folder = savefolder + os.sep + uuid

    necessary_folders = ['raw_images', 'aligned_images', 'generated_images', 'latent_representations']
    for folder in necessary_folders:
        utils.local_mkdir(merge_folder + os.sep + folder)

    print("Writing a and b pictures...")
    cv2.imwrite(f'{merge_folder}/raw_images/a.png', a)
    cv2.imwrite(f'{merge_folder}/raw_images/b.png', b)

    print("executing align...")
    command_align = f"python align_images.py {merge_folder}/raw_images/ {merge_folder}/aligned_images/"
    utils.execute(command=command_align, workdir=babygun_path)

    print("executing merge...")
    command_merge = f"python3 encode_images.py --early_stopping=False --lr=0.25 --batch_size=2 --iterations=12 " \
                    f"--output_video=False {merge_folder}/aligned_images {merge_folder}/generated_images " \
                    f"{merge_folder}/latent_representations"
    utils.execute(command=command_merge, workdir=babygun_path)
    result_name = np.random.choice(["a", "b"])
    result = cv2.imread(f'{merge_folder}/generated_images/{result_name}_01.png')
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
