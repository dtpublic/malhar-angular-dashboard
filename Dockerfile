FROM ubuntu:14.04
RUN apt-get update && apt-get install git wget -y &&  wget -qO- https://deb.nodesource.com/setup_4.x | sudo bash - 
RUN apt-get install nodejs -y && npm install -g bower gulp && npm install gulp
RUN mkdir -p /usr/src/app
EXPOSE 3000
WORKDIR /usr/src/app
ADD . /usr/src/app
RUN bower install --allow-root && npm install
RUN gulp 
