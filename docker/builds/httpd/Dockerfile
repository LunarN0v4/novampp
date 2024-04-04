FROM debian:12
ARG IMAGE_NAME=novampp-httpd
WORKDIR /
RUN apt-get update && apt-get upgrade -y && apt-get install -y --fix-missing --install-recommends apache2 libapache2-mod php8.2 perl curl wget openssl certbot && apt-get clean
COPY ./httpd.conf /etc/apache2/conf/httpd.conf
RUN a2enmod perl php8.2 ssl rewrite access_compat alias auth_basic auth_pubtkt authn_core authn_file authnz_ldap authz_core authz_host authz_user autoindex cgid deflate dir env filter headers http2 ldap macro mime mpm_prefork negotiation proxy proxy_ajp proxy_balancer proxy_connect proxy_express proxy_fcgi proxy_fdpass proxy_ftp proxy_hcheck proxy_html proxy_http proxy_http2 proxy_scgi proxy_uwsgi proxy_wstunnel reqtimeout setenvif slotmem_shm socache_shmcb status userdir xml2enc
RUN a2enconf httpd
CMD ["apache2ctl", "-D", "FOREGROUND"]