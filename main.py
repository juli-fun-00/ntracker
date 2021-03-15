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

# глобальные переменные, будут заполнены при парсинге в parse_args
SAVE_FOLDER = ""
YADISK_FOLDER = ""
YADISK_TOKEN = ""

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
    Здесь нейронка вызывается и получаем картинку
    """
    merged_img = old_img
    return merged_img


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
    x_half = 1920 // 2
    y_half = 1080 // 2
    class_type = "bottom_right"
    y = center[0]
    x = center[1]
    if x < x_half and y < y_half:
        class_type = "top_left"
    elif x < x_half and y > y_half:
        class_type = "bottom_left"
    elif x > x_half and y < y_half:
        class_type = "top_right"
    else:
        class_type = "bottom_right"

    print(f"calculated center: x: {x}, y: {y} => type is {class_type}")
    return class_type


# routes
@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
    })


@app.post("/face")
async def face_process(uuid: str, image: UploadFile = File(...), points: str = Body(...)):
    """
    Обрабатываем входящую картинку и хит-мапу в виде точек.
    Формат для points: {"points": [[1,2,3],[4,5,6]]}. [[x,y], [x,y]...]
    """
    print(f"--------------- New request -------------")
    input_points = points
    points = json.loads(input_points)['points']
    print(f"Received uuid: {uuid}, size of points {len(points)}")

    # классицифируем
    class_type = classify(calculate_center(points))
    print(f"Classified to type {class_type}")

    # прописываем локальные и удаленные (которые на yadisk) пути
    remote_img_path = YADISK_FOLDER + os.sep + class_type + os.sep + uuid + ".png"
    local_img_path = SAVE_FOLDER + os.sep + class_type + os.sep + uuid + ".png"

    remote_json_path = YADISK_FOLDER + os.sep + class_type + os.sep + uuid + ".json"
    local_json_path = SAVE_FOLDER + os.sep + class_type + os.sep + uuid + ".json"

    remote_last_same_img_path = YADISK_FOLDER + os.sep + "last_" + class_type + ".png"
    local_last_same_img_path = SAVE_FOLDER + os.sep + "last_" + class_type + ".png"

    # достаем последнюю картинку такого же класса
    print("Getting the same class image from yadisk")
    download(remote_last_same_img_path, local_last_same_img_path)
    same_class_img = cv2.imread(local_last_same_img_path)

    # читаем переданную в параметрах картинку
    print("Reading input pic")
    contents = await image.read()
    nparr = np.fromstring(contents, np.uint8)
    input_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # сохраняем на yadisk входную картинку
    print("Saving input pic")
    if not cv2.imwrite(local_img_path, input_img):
        print(f"ERROR on imwrite {local_img_path}")
        raise Exception("bad imwrite happened")

    upload(local_img_path, remote_img_path)

    # сохраняем на yadisk входные точки
    print("Saving input json-points")
    with open(local_json_path, "w+") as file:
        file.write(input_points)
    upload(local_json_path, remote_json_path)

    # объединяем эти картинки нейронкой
    print("processing pictures with nn")
    result_img = process(old_img=same_class_img, new_img=input_img)

    # сохраняем на yadisk картинку-результат
    print("saving result-pic on yadisk")
    if not cv2.imwrite(local_last_same_img_path, result_img):
        print(f"ERROR on imwrite {local_last_same_img_path}")
        raise Exception("bad imwrite happened")

    upload(local_last_same_img_path, remote_last_same_img_path)

    # удаляем локальные файлы
    os.remove(local_last_same_img_path)
    os.remove(local_img_path)
    os.remove(local_json_path)

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


def local_mkdir(path: str) -> None:
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)
        print(f"folder {path} created on locally because it was not exists")


def make_folders():
    # локально
    local_mkdir(SAVE_FOLDER + os.sep + "top_left")
    local_mkdir(SAVE_FOLDER + os.sep + "top_right")
    local_mkdir(SAVE_FOLDER + os.sep + "bottom_left")
    local_mkdir(SAVE_FOLDER + os.sep + "bottom_right")

    # на yadisk
    yadisk_mkdir(YADISK_FOLDER + os.sep + "top_left")
    yadisk_mkdir(YADISK_FOLDER + os.sep + "top_right")
    yadisk_mkdir(YADISK_FOLDER + os.sep + "bottom_left")
    yadisk_mkdir(YADISK_FOLDER + os.sep + "bottom_right")


def parse_args():
    global SAVE_FOLDER, YADISK_FOLDER, YADISK_TOKEN

    parser = argparse.ArgumentParser()

    parser.add_argument("--SAVE_FOLDER", default="/home/alex/ntracker/savefolder", type=str,
                        help="path folder where we download data from yadisk")
    parser.add_argument("--YADISK_FOLDER", default="disk:/Приложения/N-tracker", type=str,
                        help="path folder where we download data from yadisk")
    parser.add_argument("--YADISK_TOKEN", default="", type=str,
                        help="token to work with yadisk")

    args = parser.parse_args()
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

    # создаем папки локально и на ядиске
    make_folders()
    if not os.path.exists(SAVE_FOLDER):
        os.makedirs(SAVE_FOLDER, exist_ok=True)
        print(f"Create path {SAVE_FOLDER} because it didn't exist")

    # запускаем сервер
    uvicorn.run(app)
