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
from starlette.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from io import BytesIO

# глобальные переменные, будут заполнены при парсинге в мейне
SAVE_FOLDER = ""
YADISK_FOLDER = ""


# fastapi
templates = Jinja2Templates(directory="templates")
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# yadisk
my_disk = yadisk.YaDisk(token="AgAAAAAhlmtfAAbp9UGV53wjhkpFrRWqMUzszeQ")


def download(source, destination) -> None:
    print(f"Downloading source: '{source}' to '{destination}' ...")
    my_disk.download(source, destination)


def upload(source, destination) -> None:
    print(f"Uploading source: '{source}' to '{destination}' ...")
    my_disk.upload(source, destination)


def process(img):
    return img


def calculate_center(points: List[List[int]]):
    pass


def classify(center: int):
    pass


# routes
@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
    })


@app.post("/points")
async def points_process(points: List[List[int]] = Body(...)):
    return {"received points": points}



@app.post("/face")
async def face_process(uuid: str, image: UploadFile = File(...), points: str = Body(...)):
    """points: {"points": [[1,2,3],[4,5,6]]}"""
    # image = face_data.image
    # uuid = face_data.uuid
    points = json.loads(points)['points']
    print(f"Received uuid: {uuid} --- points: {[points]}")

    remote_img_path = YADISK_FOLDER + os.sep + uuid + ".png"
    local_img_path = SAVE_FOLDER + os.sep + uuid + ".png"

    remote_json_path = YADISK_FOLDER + os.sep + uuid + ".json"
    local_json_path = SAVE_FOLDER + os.sep + uuid + ".json"

    contents = await image.read()
    nparr = np.fromstring(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    img = process(img)

    _, encoded_img = cv2.imencode('.PNG', img)
    encoded_img = base64.b64encode(encoded_img)
    return {"encoded_image": encoded_img}


def parse_args():
    global SAVE_FOLDER, YADISK_FOLDER

    parser = argparse.ArgumentParser()

    parser.add_argument("--SAVE_FOLDER", default="/home/alex/ntracker/savefolder", type=str,
                        help="path folder where we download data from yadisk")
    parser.add_argument("--YADISK_FOLDER", default="disk:/Приложения/N-tracker", type=str,
                        help="path folder where we download data from yadisk")

    args = parser.parse_args()
    SAVE_FOLDER = args.SAVE_FOLDER
    YADISK_FOLDER = args.YADISK_FOLDER

    if SAVE_FOLDER[-1] == '/':
        SAVE_FOLDER = SAVE_FOLDER[:-1]

    if YADISK_FOLDER[-1] == '/':
        YADISK_FOLDER = YADISK_FOLDER[:-1]

    print(f"SAVE_FOLDER   is '{SAVE_FOLDER}'")
    print(f"YADISK_FOLDER is '{YADISK_FOLDER}'")


if __name__ == "__main__":
    print("Program started")
    parse_args()

    if not os.path.exists(SAVE_FOLDER):
        os.makedirs(SAVE_FOLDER, exist_ok=True)
        print(f"Create path {SAVE_FOLDER} because it didn't exist")

    uvicorn.run(app)
