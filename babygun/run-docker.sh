#!/bin/bash

docker run -it --rm --name babygun --gpus all -p 9080:9080 -v /home/air/ntracker/savefolder/:/opt/savefolder babygun
