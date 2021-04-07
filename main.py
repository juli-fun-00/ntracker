import yadisk
import cv2
import uvicorn
import os
import argparse
import json
import base64
import numpy as np
from fastapi import FastAPI, Request, UploadFile, File, Body, Form
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from typing import List
import merger
import utils

from pydantic import BaseModel


class Points(BaseModel):
    points: List[int]


# глобальные переменные, будут заполнены при парсинге в parse_args
SAVE_FOLDER = ""
YADISK_FOLDER = ""
YADISK_TOKEN = ""
BABYGUN_FOLDER = ""
CLASSES = ["ambient", "scanner"]
CLASS_MESSAGES = {
    "ambient": [
        # 1
        "Сейчас ваше восприятие склонно к амбъентному типу. Что это значит? Взгляд настроен воспринимать лицо как "
        "единое целое, а не составные части. Такой тип обеспечивает быстрое распознование базовых эмоций человека.",
        # 2
        "Ваш способ восприятия лиц на данный момент — синтетический. Особенно чутко вы сейчас сможете распознать "
        "выражения грусти, гнева, удивления и радости. Именно этот способ присущ людям 70% времени"],

    "scanner": [
        # 1
        "Ваш способ восприятия лиц на данный момент — аналитический. Особенно чутко вы сейчас сможете распознать "
        "выражения удивления и отвращения.  Этот способ присущ людям всего 30% времени.",
        # 2
        "Сейчас ваше восприятие склонно к факальному типу. Что это значит? Взгляд настроен воспринимать лицо по "
        "отдельным частям и только после этого составлять общую картинку. При взаимодействии с людьми у вас "
        "включается аналитический способ межличностного восприятия. "
    ]
}

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


def process(old_img, new_img, uuid):
    """
    Принимаем 2 картинки, мерджим их с помощью нейронки, результат возвращаем
    """
    # TODO вернуть merger, пока для теста так оставим
    return merger.merge(a=old_img, b=new_img, babygun_path=BABYGUN_FOLDER, savefolder=SAVE_FOLDER, uuid=uuid)
    # return old_img


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
    Классифицифруем допустим что точки принимаю значения x - [0, 1920] y - [0, 1080]
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


# @app.get("/test_face")
# async def root(request: Request):
#     pic = cv2.imread(SAVE_FOLDER + os.sep + "test_images/a.jpeg")
#     _, encoded_img = cv2.imencode('.PNG', pic)
#     encoded_img = base64.b64encode(encoded_img)
#     return {"encoded_image": encoded_img,
#             "class": CLASSES[0]}

# , points: List[Points] = Form(...)
@app.get("/classify")
async def classify(uuid: str):
    """
    description
    """
    print(f"--------------- New request /classify -------------")
    # print('points are', points)
    # print('points type is', type(points))

    class_type = CLASSES[0]

    # загружаем сохранянную из /face запроса картинку на yadisk
    remote_img_path = YADISK_FOLDER + os.sep + class_type + os.sep + uuid + ".png"
    local_img_path = SAVE_FOLDER + os.sep + uuid + os.sep + uuid + ".png"
    upload(local_img_path, remote_img_path)

    return {"class": class_type,
            "message": np.random.choice(CLASS_MESSAGES[class_type])}

    points_json = json.loads(points)
    points = points_json['points']
    print(f"Received uuid: {uuid} and points len is {len(points)}")

    # классицифируем
    class_type = await classify(calculate_center(points))
    print(f"Classified to type {class_type}")

    # пути

    remote_points_path = YADISK_FOLDER + os.sep + class_type + os.sep + uuid + ".json"
    local_points_path = SAVE_FOLDER + os.sep + uuid + os.sep + "points.json"

    # сохраняем на yadisk входные точки
    print("Saving input json-points")
    with open(local_points_path, "w+") as file:
        file.write(points_json)
    upload(local_points_path, remote_points_path)

    # удаляем локальные файлы относящиеся к этому запросу
    os.remove(SAVE_FOLDER + os.sep + uuid)

    return {"class": class_type,
            "message": await np.random.choice(CLASS_MESSAGES[class_type])}


@app.post("/face")
async def face_process(uuid: str, image: UploadFile = File(...)):
    """
    Обрабатываем фото пользователя
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
    result_img = process(old_img=last_merged, new_img=input_img, uuid=uuid)

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
    global SAVE_FOLDER, YADISK_FOLDER, YADISK_TOKEN, BABYGUN_FOLDER

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
    BABYGUN_FOLDER = args.BABYGUN_FOLDER

    if SAVE_FOLDER[-1] == '/':
        SAVE_FOLDER = SAVE_FOLDER[:-1]
    if YADISK_FOLDER[-1] == '/':
        YADISK_FOLDER = YADISK_FOLDER[:-1]
    if BABYGUN_FOLDER[-1] == '/':
        BABYGUN_FOLDER = BABYGUN_FOLDER[:-1]

    print(f"SAVE_FOLDER   is '{SAVE_FOLDER}'")
    print(f"YADISK_FOLDER is '{YADISK_FOLDER}'")
    print(f"BABYGUN_FOLDER is '{BABYGUN_FOLDER}'")


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
