FROM httpd:2.4-bookworm
ARG IMAGE_NAME=novampp-httpd
WORKDIR /
RUN apt-get update && apt-get upgrade -y --fix-missing --install-recommends
RUN apt-get install -y --fix-missing --install-recommends apt-utils
RUN apt-get install -y --fix-missing --install-recommends bzip2 apache2 php8.2 php8.2-curl perl curl wget openssl certbot
RUN mkdir -p /novampp-tmp/apache2mods-available
RUN cp /etc/apache2/mods-available/* /novampp-tmp/apache2mods-available/ -r
RUN rm -rf /etc/apache2
COPY ./apache2 /etc/apache2
RUN mkdir -p /etc/apache2/conf-enabled
RUN mkdir -p /etc/apache2/mods-enabled
RUN mkdir -p /etc/apache2/sites-enabled
RUN cp /novampp-tmp/apache2mods-available/* /etc/apache2/mods-available/ -r
RUN rm -rf /novampp-tmp/
RUN mkdir -p /usr/local/apache2/conf
RUN mkdir -p /usr/local/apache2/htdocs
RUN a2dismod mpm_event mpm_worker && a2enmod mpm_prefork
RUN apt-get install -y --fix-missing --install-recommends libapache2-mod-perl2 libapache2-mod-php8.2 libapache2-mod-auth-pubtkt libapache2-mod-proxy-uwsgi
RUN a2enmod perl php8.2 ssl rewrite access_compat alias auth_basic auth_pubtkt authn_core authn_file authnz_ldap authz_core authz_host authz_user autoindex cgid deflate dir env filter headers http2 ldap macro mime mpm_prefork negotiation proxy proxy_ajp proxy_balancer proxy_connect proxy_express proxy_fcgi proxy_fdpass proxy_ftp proxy_hcheck proxy_html proxy_http proxy_http2 proxy_scgi proxy_uwsgi proxy_wstunnel reqtimeout setenvif slotmem_shm socache_shmcb status userdir xml2enc
RUN a2enconf charset localized-error-pages other-vhosts-access-log security serve-cgi-bin
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
RUN apt-get clean
CMD ["apache2ctl", "-D", "FOREGROUND"]