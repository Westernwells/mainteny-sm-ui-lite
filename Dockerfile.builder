FROM node:lts-gallium

ADD . /home/sm-ui-lite
RUN cd /home/sm-ui-lite && yarn install --frozen-lockfile

