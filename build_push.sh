sudo docker build -f Dockerfile -t ntracker .
sudo docker tag ntracker alex9430/ntracker:latest
sudo docker push alex9430/ntracker:latest