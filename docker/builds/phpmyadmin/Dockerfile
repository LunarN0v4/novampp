FROM phpmyadmin:apache
ARG IMAGE_NAME=novampp-phpmyadmin
WORKDIR /
RUN apt-get update && apt-get upgrade -y --fix-missing --install-recommends
COPY ./phpmyadmin.inc.php /etc/phpmyadmin/config.inc.php