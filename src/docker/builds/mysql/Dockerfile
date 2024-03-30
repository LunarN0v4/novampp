FROM debian:12
ARG IMAGE_NAME=novampp-mysql
WORKDIR /
RUN apt-get update && apt-get upgrade -y && apt-get install -y gpg && apt-get clean
RUN gpg --homedir /tmp --no-default-keyring --keyring /usr/share/keyrings/mysql-server.gpg --keyserver pgp.mit.edu --recv-keys 3A79BD29
RUN echo "deb [signed-by=/usr/share/keyrings/mysql-server.gpg] http://repo.mysql.com/apt/debian/ `lsb_release -cs` mysql-innovation" | sudo tee /etc/apt/sources.list.d/mysql-server.list
RUN apt-get update && apt-get install -y mysql-server && apt-get clean
CMD ["mysqld"]