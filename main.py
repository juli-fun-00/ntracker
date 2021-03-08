import yadisk
import cv2
import uvicorn
import os
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.responses import StreamingResponse
from io import BytesIO

TMP_FOLDER = "opt/ntracker/savefolder"

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

my_disk = yadisk.YaDisk(token="AgAAAAAhlmtfAAbp9UGV53wjhkpFrRWqMUzszeQ")


@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
        "testVar": 1234
    })


@app.put("/face")
async def root(uuid: str):
    my_disk.download(uuid, TMP_FOLDER)
    img_path = TMP_FOLDER + os.sep + uuid + ".png"
    mat = cv2.imread(img_path)
    res, im_png = cv2.imencode(".png", mat)
    return StreamingResponse(BytesIO(im_png.tobytes()), media_type="image/png")


if __name__ == "__main__":
    uvicorn.run(app)
