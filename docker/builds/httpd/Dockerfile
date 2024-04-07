FROM debian:12
ARG IMAGE_NAME=novampp-httpd
WORKDIR /
RUN apt-get update && apt-get upgrade -y && apt-get install -y --fix-missing --install-recommends apt-utils
RUN mkdir -p /var/www/html
RUN mkdir -p /etc/apache2/conf-enabled
RUN mkdir -p /etc/apache2/mods-enabled
RUN mkdir -p /etc/apache2/sites-enabled
RUN apt-get install -y --fix-missing --install-recommends bzip2 apache2 php8.2 php8.2-curl perl curl wget openssl certbot git nodejs npm
RUN mkdir -p /novampp-tmp/apache2mods-available
RUN cp /etc/apache2/mods-available/* /novampp-tmp/apache2mods-available/ -r
RUN rm -rf /etc/apache2
COPY ./apache2 /etc/apache2
RUN cp /novampp-tmp/apache2mods-available/* /etc/apache2/mods-available/ -r
RUN rm -rf /novampp-tmp/
RUN a2dismod mpm_event mpm_worker && a2enmod mpm_prefork
RUN apt-get install -y --fix-missing --install-recommends libapache2-mod-perl2 libapache2-mod-php8.2 libapache2-mod-auth-pubtkt libapache2-mod-proxy-uwsgi
RUN a2enmod perl php8.2 ssl rewrite access_compat alias auth_basic auth_pubtkt authn_core authn_file authnz_ldap authz_core authz_host authz_user autoindex cgid deflate dir env filter headers http2 ldap macro mime mpm_prefork negotiation proxy proxy_ajp proxy_balancer proxy_connect proxy_express proxy_fcgi proxy_fdpass proxy_ftp proxy_hcheck proxy_html proxy_http proxy_http2 proxy_scgi proxy_uwsgi proxy_wstunnel reqtimeout setenvif slotmem_shm socache_shmcb status userdir xml2enc
RUN a2enconf charset localized-error-pages other-vhosts-access-log security serve-cgi-bin
RUN git clone --depth=1 --branch=STABLE https://github.com/phpmyadmin/phpmyadmin.git /var/www/phpmyadmin
RUN cd /var/www/phpmyadmin && npm install -g corepack && corepack enable
RUN cd /var/www/phpmyadmin && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
RUN cd /var/www/phpmyadmin && php -r "if (hash_file('sha384', 'composer-setup.php') === 'dac665fdc30fdd8ec78b38b9800061b4150413ff2e3b6f88543c636f7cd84f6db9189d43a81e5503cda447da73c7e5b6') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
RUN cd /var/www/phpmyadmin && php composer-setup.php --install-dir=/usr/local/bin --filename=composer
RUN cd /var/www/phpmyadmin && php -r "unlink('composer-setup.php');"
RUN apt-get install -y --fix-missing --install-recommends php8.2-mysqli php8.2-xml php8.2-simplexml php8.2-xmlwriter php8.2-zip
RUN cd /var/www/phpmyadmin && export COMPOSER_ALLOW_SUPERUSER=1 && composer update --no-dev
RUN cd /var/www/phpmyadmin && yarn install --production
COPY ./phpmyadmin.inc.php /var/www/phpmyadmin/config.inc.php
RUN apt-get clean
CMD ["apache2ctl", "-D", "FOREGROUND"]