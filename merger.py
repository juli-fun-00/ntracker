import subprocess
import cv2


babygun_path = "/opt/ntracker/babygun"
# babygun_path = "/home/alex/PycharmProjects/ntracker/babygun"


def merge(a, b, uuid):
    result = a
    command1 = f"python3 {babygun_path}/encode_images.py --early_stopping=False --lr=0.25 --batch_size=2 --iterations=100 " \
               f"--output_video=False {babygun_path}/aligned_images {babygun_path}/generated_images " \
               f"{babygun_path}/latent_representations "
    print(command1)
    bash_cmd1 = command1.split(" ")
    process = subprocess.Popen(bash_cmd1, cwd=babygun_path, stdout=subprocess.PIPE)
    print("waiting subprocess")
    process.wait()
    print("subprocess finished")
    return result


if __name__ == "__main__":
    print("Merging main test started")
    test_prefix = '/opt/savefolder/test_images/'
    a = cv2.imread(test_prefix + "a.jpeg")
    b = cv2.imread(test_prefix + "b.jpeg")
    result = merge(a, b, "1234")
    if result is not None:
        cv2.imwrite(test_prefix + "result.png", result)
    print("Done, saved")
