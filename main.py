import yadisk
import cv2
import uvicorn
import os
import argparse
import json
import base64
import numpy as np
from fastapi import FastAPI, Request, UploadFile, File, Body
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from typing import List
import merger
import utils

# глобальные переменные, будут заполнены при парсинге в parse_args
SAVE_FOLDER = ""
YADISK_FOLDER = ""
YADISK_TOKEN = ""
CLASSES = ["ambient", "scanner"]
CLASS_MESSAGES = {"ambient": ["ambient_msg1", "ambient_msg2", "ambient_msg3"],
                  "scanner": ["scanner_msg1", "scanner_msg2", "scanner_msg3"]}

# fastapi
templates = Jinja2Templates(directory="templates")
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# yadisk
my_disk = None


def download(source, destination) -> None:
    print(f"Downloading source: '{source}' to '{destination}' ...")
    my_disk.download(source, destination)


def upload(source, destination) -> None:
    print(f"Uploading source: '{source}' to '{destination}' ...")
    my_disk.upload(source, destination, overwrite=True)


def process(old_img, new_img):
    """
    Принимаем 2 картинки, мерджим их с помощью нейронки, результат возвращаем
    """
    merged_img = old_img
    return merger.merge(old_img, new_img)


def calculate_center(points: List[List[int]]) -> List[int]:
    """
    Находим центр масс(среднее) всех точек, смотрим концентрацию взгляда.
    """
    # Подумать нужен ли нам центроид (по теореме Грина) или все-таки среднее?
    x = [p[0] for p in points]
    y = [p[1] for p in points]
    center_average = [int(sum(x) / len(points)), int(sum(y) / len(points))]
    return center_average


def classify(center: List[int]) -> str:
    """
    Классифицифруем, возможные исходы: top_left, top_right, bottom_left, bottom_right
    допустим что точки принимаю значения x - [0, 1920] y - [0, 1080]
    и начало отсчета в левом верхнем углу, луч x направлен вправо, луч y вниз
    """
    y = center[0]
    x = center[1]

    return np.random.choice(CLASSES)


# routes
@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
    })


@app.get("/test_face")
async def root(request: Request):
    pic = cv2.imread(SAVE_FOLDER + os.sep + "test_images/a.jpeg")
    _, encoded_img = cv2.imencode('.PNG', pic)
    encoded_img = base64.b64encode(encoded_img)
    return {"encoded_image": encoded_img,
            "class": CLASSES[0]}


@app.post("/classify")
async def classify(uuid: str, points: str = Body(...)):
    """
    Формат
    для
    points: {"points": [[1, 2, 3], [4, 5, 6]]}.[[x, y], [x, y]...]
    """
    input_points = points
    points = json.loads(input_points)['points']
    print(f"Received uuid: {uuid}")

    # классицифируем
    class_type = classify(calculate_center(points))
    print(f"Classified to type {class_type}")

    # пути
    remote_img_path = YADISK_FOLDER + os.sep + class_type + os.sep + uuid + ".png"
    local_img_path = SAVE_FOLDER + os.sep + uuid + os.sep + uuid + ".png"

    remote_points_path = YADISK_FOLDER + os.sep + class_type + os.sep + uuid + ".json"
    local_points_path = SAVE_FOLDER + os.sep + uuid + os.sep + "points.json"

    # загружаем сохранянную из /face запроса картинку на yadisk
    upload(local_img_path, remote_img_path)

    # сохраняем на yadisk входные точки
    print("Saving input json-points")
    with open(local_points_path, "w+") as file:
        file.write(input_points)
    upload(local_points_path, remote_points_path)


    # удаляем локальные файлы относящиеся к этому запросу
    # os.remove(SAVE_FOLDER + os.sep + uuid)
    #

    return {"class": class_type,
            "message": np.random.choice(CLASS_MESSAGES[class_type])}


@app.post("/face")
async def face_process(uuid: str, image: UploadFile = File(...), points: str = Body(...)):
    """
    Обрабатываем входящую картинку и хит-мапу в виде точек.

    """
    print(f"--------------- New request /face -------------")
    print(f"Received uuid: {uuid}")

    # создаем папку, в которой будут храниться временные картинки для этого запроса
    utils.local_mkdir(SAVE_FOLDER + os.sep + uuid)

    # прописываем локальные и удаленные (которые на yadisk) пути
    local_img_path = SAVE_FOLDER + os.sep + uuid + os.sep + uuid + ".png"

    remote_last_merged_img_path = YADISK_FOLDER + os.sep + "last_merged.png"
    local_last_merged_img_path = SAVE_FOLDER + os.sep + uuid + os.sep + "last_merged.png"

    # читаем переданную в параметрах картинку
    print("Reading input pic")
    contents = await image.read()
    nparr = np.fromstring(contents, np.uint8)
    input_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # сохраняем входную картинку
    print("Saving input pic")
    if not cv2.imwrite(local_img_path, input_img):
        print(f"ERROR on imwrite {local_img_path}")
        raise Exception("bad imwrite happened")

    # достаем последнюю merged картинку c ядиска
    print("Getting the same class image from yadisk")
    download(remote_last_merged_img_path, local_last_merged_img_path)
    last_merged = cv2.imread(local_last_merged_img_path)

    # объединяем эти картинки нейронкой
    print("processing pictures with nn")
    result_img = process(old_img=last_merged, new_img=input_img)

    # сохраняем на yadisk картинку-результат
    print("saving result-pic on yadisk")
    if not cv2.imwrite(local_last_merged_img_path, result_img):
        print(f"ERROR on imwrite {local_last_merged_img_path}")
        raise Exception("bad imwrite happened")

    upload(local_last_merged_img_path, remote_last_merged_img_path)

    # отправляем картинку-результат в виде закодированной строки на фронт
    print("sending result pic to front")
    _, encoded_img = cv2.imencode('.PNG', result_img)
    encoded_img = base64.b64encode(encoded_img)
    return {"encoded_image": encoded_img}


def yadisk_mkdir(path: str) -> None:
    if not my_disk.exists(path):
        try:
            my_disk.mkdir(path)
            print(f"folder {path} created on yadisk because it was not exists")
        except:
            pass


def make_folders():
    # на yadisk
    for cls in CLASSES:
        yadisk_mkdir(YADISK_FOLDER + os.sep + cls)


def parse_args():
    global SAVE_FOLDER, YADISK_FOLDER, YADISK_TOKEN

    parser = argparse.ArgumentParser()

    parser.add_argument("--SAVE_FOLDER", default="/home/alex/ntracker/savefolder", type=str,
                        help="path folder where we download data from yadisk")
    parser.add_argument("--YADISK_FOLDER", default="disk:/Приложения/N-tracker", type=str,
                        help="path folder where we download data from yadisk")
    parser.add_argument("--YADISK_TOKEN", default="", type=str,
                        help="token to work with yadisk")
    parser.add_argument("--BABYGUN_FOLDER", default="babygun", type=str,
                        help="token to work with yadisk")

    args = parser.parse_args()

    # Достаем аргументы
    SAVE_FOLDER = args.SAVE_FOLDER
    YADISK_FOLDER = args.YADISK_FOLDER
    YADISK_TOKEN = args.YADISK_TOKEN

    if SAVE_FOLDER[-1] == '/':
        SAVE_FOLDER = SAVE_FOLDER[:-1]

    if YADISK_FOLDER[-1] == '/':
        YADISK_FOLDER = YADISK_FOLDER[:-1]

    print(f"SAVE_FOLDER   is '{SAVE_FOLDER}'")
    print(f"YADISK_FOLDER is '{YADISK_FOLDER}'")


if __name__ == "__main__":
    print("Program started")
    # парсим аргументы
    parse_args()

    # коннектимся к диске
    my_disk = yadisk.YaDisk(token=YADISK_TOKEN)

    # создаем папки для классов на ядиске
    make_folders()
    if not os.path.exists(SAVE_FOLDER):
        os.makedirs(SAVE_FOLDER, exist_ok=True)
        print(f"Create path {SAVE_FOLDER} because it didn't exist")

    # запускаем сервер
    uvicorn.run(app)
