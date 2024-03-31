FROM debian:12
ARG IMAGE_NAME=novampp-httpd
WORKDIR /
RUN apt-get update && apt-get upgrade -y && apt-get install -y apache2 libapache2-mod openssl && apt-get clean
COPY ./httpd.conf /etc/apache2/conf/httpd.conf
CMD ["apache2ctl", "-D", "FOREGROUND"]