FROM mariadb:latest
WORKDIR /
RUN apt-get update && apt-get upgrade -y --fix-missing --install-recommends
COPY ./my.cnf /etc/mysql/conf.d/my.cnf
RUN mkdir -p /var/lib/mysql/
COPY ./novampp.sh /docker-entrypoint-initdb.d/novampp.sh
COPY ./novampp.sql /docker-entrypoint-initdb.d/novampp.sql
RUN apt-get clean