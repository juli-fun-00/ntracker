#!/bin/sh

docker run -p 8000:8000 -v /Users/julia/Desktop/ntracker/main.py:/opt/ntracker/main.py -v /Users/julia/Desktop/ntracker/savefolder:/opt/savefolder alex9430/ntracker --SAVE_FOLDER=/opt/savefolder --YADISK_TOKEN=AgAAAAAhlmtfAAbp9UGV53wjhkpFrRWqMUzszeQ --BABYGUN_FOLDER=/opt/ntracker/babygun
