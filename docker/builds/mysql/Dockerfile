FROM debian:12
ARG IMAGE_NAME=novampp-mysql
WORKDIR /
RUN apt-get update && apt-get upgrade -y && apt-get install -y --fix-missing --install-recommends gpg wget curl lsb-release && apt-get clean
RUN gpg --homedir /tmp --no-default-keyring --keyring /usr/share/keyrings/mysql-server.gpg --keyserver pgp.mit.edu --recv-keys 3A79BD29 B7B3B788A8D3785C
RUN echo "deb [signed-by=/usr/share/keyrings/mysql-server.gpg] http://repo.mysql.com/apt/debian/ `lsb_release -cs` mysql-innovation" | tee /etc/apt/sources.list.d/mysql-server.list
RUN apt-get update && apt-get install -y --fix-missing --install-recommends mysql-server && apt-get clean
COPY ./my.cnf /etc/mysql/my.cnf
CMD ["mysqld", "-u", "root", "--init"]