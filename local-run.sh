#!/bin/sh

# Chrome display
DEVICE_ID=392153864a30ac86ff4405284c660eba6ec8b335159d7e64811a09ad1c7e2dd6 YADISK_TOKEN=AgAAAAAhlmtfAAbp9UGV53wjhkpFrRWqMUzszeQ BABYGUN_FOLDER=/Users/julia/Desktop/ntracker/babygun SAVE_FOLDER=/Users/julia/Desktop/ntracker/savefolder --reload uvicorn main:app --host 0.0.0.0
# Chrome laptop
# DEVICE_ID=c5584f6d4b1452aa1a00a47b44e5a7985fac16be2763deaf67a96a66f8c68bf0 YADISK_TOKEN=AgAAAAAhlmtfAAbp9UGV53wjhkpFrRWqMUzszeQ BABYGUN_FOLDER=/Users/julia/Desktop/ntracker/babygun SAVE_FOLDER=/Users/julia/Desktop/ntracker/savefolder uvicorn --reload main:app --host 0.0.0.0


# Safari display
# DEVICE_ID=C435B84F9F27FBF461CEF0A705713ACFEF5E3BDF YADISK_TOKEN=AgAAAAAhlmtfAAbp9UGV53wjhkpFrRWqMUzszeQ BABYGUN_FOLDER=/Users/julia/Desktop/ntracker/babygun SAVE_FOLDER=/Users/julia/Desktop/ntracker/savefolder uvicorn --reload main:app --host 0.0.0.0
# Safari laptop
# DEVICE_ID=838E2CFC4EADB105BFC5AD4BF4F86E56B99E0B34 YADISK_TOKEN=AgAAAAAhlmtfAAbp9UGV53wjhkpFrRWqMUzszeQ BABYGUN_FOLDER=/Users/julia/Desktop/ntracker/babygun SAVE_FOLDER=/Users/julia/Desktop/ntracker/savefolder uvicorn --reload main:app --host 0.0.0.0
