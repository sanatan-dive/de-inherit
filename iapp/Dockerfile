FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# iExec TEE specific
ENV IEXEC_IN /iexec_in
ENV IEXEC_OUT /iexec_out

ENTRYPOINT ["node", "src/app.js"]
