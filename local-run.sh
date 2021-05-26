#!/bin/sh

YADISK_TOKEN=AgAAAAAhlmtfAAbp9UGV53wjhkpFrRWqMUzszeQ BABYGUN_FOLDER=/Users/julia/Desktop/ntracker/babygun SAVE_FOLDER=/Users/julia/Desktop/ntracker/savefolder uvicorn --reload main:app --host 0.0.0.0
