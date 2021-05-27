FROM tensorflow/tensorflow:1.15.0-gpu-py3


RUN apt-get update \
    && apt-get install -qy build-essential wget curl bzip2 ca-certificates \
                           git cmake libsm6 libxrender1 libfontconfig1 \
                           libprotobuf-dev libleveldb-dev libsnappy-dev \
                           libhdf5-serial-dev protobuf-compiler imagemagick \
                           libgflags-dev libgoogle-glog-dev liblmdb-dev cpio \
                           libgl1-mesa-glx \
                           python3-pip locales \
    && rm -rf /var/lib/apt/lists/*

# get python3.6
RUN add-apt-repository ppa:deadsnakes/ppa && apt-get update && apt-get install -y python3.6
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.6 100 && python3 -V
RUN python3 -m pip install --user --upgrade pip

#install  requirements
COPY requirements.txt /opt/ntracker/requirements.txt
RUN pip install --upgrade pip
RUN pip install -r /opt/ntracker/requirements.txt

#copy babygun
COPY babygun    /opt/ntracker/babygun


# copy code
COPY static       /opt/ntracker/static
COPY templates    /opt/ntracker/templates
COPY main.py      /opt/ntracker/main.py
COPY utils.py     /opt/ntracker/utils.py
COPY merger.py    /opt/ntracker/merger.py

# set runnable
WORKDIR /opt/ntracker/
ENTRYPOINT ["python", "main.py"]
