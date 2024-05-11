FROM node:22-bookworm
WORKDIR /app
RUN mkdir bin
RUN mkdir bin/piper
RUN wget -O bin/piper.tar.gz https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz
RUN tar -xvzf bin/piper.tar.gz -C bin
RUN rm bin/piper.tar.gz
COPY . .
RUN npm install
CMD ["npm", "start"]
EXPOSE 9600