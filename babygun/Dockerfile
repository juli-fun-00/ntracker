FROM tensorflow/tensorflow:1.15.0-gpu-py3


RUN apt-get update \
    && apt-get install -qy build-essential wget curl bzip2 ca-certificates \
                           git cmake libsm6 libxrender1 libfontconfig1 \
                           libprotobuf-dev libleveldb-dev libsnappy-dev \
                           libhdf5-serial-dev protobuf-compiler \
                           libgflags-dev libgoogle-glog-dev liblmdb-dev cpio \
                           libgl1-mesa-glx \
                           python3-pip locales \
    && rm -rf /var/lib/apt/lists/*

# get python3.6
RUN add-apt-repository ppa:deadsnakes/ppa && apt-get update && apt-get install -y python3.6
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.6 100 && python3 -V
RUN python3 -m pip install --user --upgrade pip


#install  requirements
COPY requirements.txt /opt/requirements.txt
RUN pip install --upgrade pip
RUN pip install -r /opt/requirements.txt

#copy babygun
COPY .    /opt/babygun

# set runnable
WORKDIR /opt/babygun/
EXPOSE 9080
ENTRYPOINT ["python", "app.py"]