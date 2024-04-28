const fs = require('fs');
const path = require('path');
const literalpath = process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA, 'NovAMPP') : process.platform === 'linux' ? '/usr/local/novampp' : '/usr/local/novampp';
function composemaker() {
    if (!fs.existsSync(literalpath)) {
        fs.mkdirSync(literalpath);
    }
    if (!fs.existsSync(literalpath + '/docker')) {
        fs.mkdirSync(literalpath + '/docker');
    }
    if (!fs.existsSync(literalpath + '/docker/builds')) {
        fs.mkdirSync(literalpath + '/docker/builds');
    }
    if (!fs.existsSync(literalpath + '/docker/data')) {
        fs.mkdirSync(literalpath + '/docker/data');
    }
    if (!fs.existsSync(literalpath + '/docker/data/httpd')) {
        fs.mkdirSync(literalpath + '/docker/data/httpd');
    }
    if (!fs.existsSync(literalpath + '/docker/data/mariadb')) {
        fs.mkdirSync(literalpath + '/docker/data/mariadb');
    }
    if (!fs.existsSync(literalpath + '/docker/builds/httpd')) {
        fs.mkdirSync(literalpath + '/docker/builds/httpd');
    }
    if (!fs.existsSync(literalpath + '/docker/builds/mariadb')) {
        fs.mkdirSync(literalpath + '/docker/builds/mariadb');
    }
    if (!fs.existsSync(literalpath + '/docker/builds/phpmyadmin')) {
        fs.mkdirSync(literalpath + '/docker/builds/phpmyadmin');
    }
    if (!fs.existsSync(literalpath + '/docker/builds/httpd/apache2')) {
        fs.mkdirSync(literalpath + '/docker/builds/httpd/apache2');
    }
    if (!fs.existsSync(literalpath + '/docker/builds/httpd/apache2/conf-available')) {
        fs.mkdirSync(literalpath + '/docker/builds/httpd/apache2/conf-available');
    }
    if (!fs.existsSync(literalpath + '/docker/builds/httpd/apache2/mods-available')) {
        fs.mkdirSync(literalpath + '/docker/builds/httpd/apache2/mods-available');
    }
    if (!fs.existsSync(literalpath + '/docker/builds/httpd/apache2/sites-available')) {
        fs.mkdirSync(literalpath + '/docker/builds/httpd/apache2/sites-available');
    }
    if (!fs.existsSync(literalpath + '/docker/builds/httpd/apache2/conf-enabled')) {
        fs.mkdirSync(literalpath + '/docker/builds/httpd/apache2/conf-enabled');
    }
    if (!fs.existsSync(literalpath + '/docker/builds/httpd/apache2/mods-enabled')) {
        fs.mkdirSync(literalpath + '/docker/builds/httpd/apache2/mods-enabled');
    }
    if (!fs.existsSync(literalpath + '/docker/builds/httpd/apache2/sites-enabled')) {
        fs.mkdirSync(literalpath + '/docker/builds/httpd/apache2/sites-enabled');
    }
    createcompose();
    createapache2();
    createmariadb();
    createpma();
};
function createcompose() {
    const dockerCompose = `version: '3'
services:
    novampp-httpd:
        build: ./builds/httpd/
        container_name: novampp-httpd
        image: novampp-httpd
        volumes:
            - ./data/httpd:/usr/local/apache2/htdocs/
            - ./data/httpd:/var/www/html/
        restart: always
        ports:
            - 80:80
            - 443:443
        networks:
            novampp:
                ipv4_address: 172.20.0.2
    novampp-mariadb:
        build: ./builds/mariadb/
        container_name: novampp-mariadb
        image: novampp-mariadb
        volumes:
          - ./data/mariadb:/var/lib/mysql
        restart: always
        environment:
            # Edit root password for MDB here, highly recommended for production environments
            - MARIADB_ROOT_PASSWORD=root
        ports:
            - 3306:3306
        networks:
            novampp:
                ipv4_address: 172.20.0.3
    novampp-phpmyadmin:
        build: ./builds/phpmyadmin/
        container_name: novampp-phpmyadmin
        image: novampp-phpmyadmin
        restart: always
        environment:
            # Edit root password for PMA here, highly recommended for production environments
            - PMA_ARBITRARY=1
            - PMA_USER=root
            - PMA_PASSWORD=root
        ports:
            - 8080:80
        networks:
            novampp:
                ipv4_address: 172.20.0.4
networks:
    novampp:
        name: novampp
        driver: bridge
        ipam:
            config:
                - subnet: 172.20.0.0/16
                  gateway: 172.20.0.1`;
    fs.writeFileSync(literalpath + '/docker/docker-compose.yaml', dockerCompose);
};
function createapache2() {
    const apache2dockerfile = `FROM httpd:2.4-bookworm
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
CMD ["apache2ctl", "-D", "FOREGROUND"]`;
    const httpdconf = `#
# This is the main Apache HTTP server configuration file.  It contains the
# configuration directives that give the server its instructions.
# See <URL:http://httpd.apache.org/docs/2.4/> for detailed information.
# In particular, see 
# <URL:http://httpd.apache.org/docs/2.4/mod/directives.html>
# for a discussion of each configuration directive.
#
# Do NOT simply read the instructions in here without understanding
# what they do.  They're here only as hints or reminders.  If you are unsure
# consult the online docs. You have been warned.  
#
# Configuration and logfile names: If the filenames you specify for many
# of the server's control files begin with "/" (or "drive:/" for Win32), the
# server will use that explicit path.  If the filenames do *not* begin
# with "/", the value of ServerRoot is prepended -- so "logs/access_log"
# with ServerRoot set to "/usr/local/apache2" will be interpreted by the
# server as "/usr/local/apache2/logs/access_log", whereas "/logs/access_log" 
# will be interpreted as '/logs/access_log'.

#
# ServerRoot: The top of the directory tree under which the server's
# configuration, error, and log files are kept.
#
# Do not add a slash at the end of the directory path.  If you point
# ServerRoot at a non-local disk, be sure to specify a local disk on the
# Mutex directive, if file-based mutexes are used.  If you wish to share the
# same ServerRoot for multiple httpd daemons, you will need to change at
# least PidFile.
#
ServerRoot "/usr/local/apache2"

#
# Mutex: Allows you to set the mutex mechanism and mutex file directory
# for individual mutexes, or change the global defaults
#
# Uncomment and change the directory if mutexes are file-based and the default
# mutex file directory is not on a local disk or is not appropriate for some
# other reason.
#
# Mutex default:logs

#
# Listen: Allows you to bind Apache to specific IP addresses and/or
# ports, instead of the default. See also the <VirtualHost>
# directive.
#
# Change this to Listen on specific IP addresses as shown below to 
# prevent Apache from glomming onto all bound IP addresses.
#
#Listen 12.34.56.78:80
Listen 80

#
# Dynamic Shared Object (DSO) Support
#
# To be able to use the functionality of a module which was built as a DSO you
# have to place corresponding \`LoadModule' lines at this location so the
# directives contained in it are actually available _before_ they are used.
# Statically compiled modules (those listed by \`httpd -l') do not need
# to be loaded here.
#
# Example:
# LoadModule foo_module modules/mod_foo.so
#
LoadModule mpm_event_module modules/mod_mpm_event.so
#LoadModule mpm_prefork_module modules/mod_mpm_prefork.so
#LoadModule mpm_worker_module modules/mod_mpm_worker.so
LoadModule authn_file_module modules/mod_authn_file.so
#LoadModule authn_dbm_module modules/mod_authn_dbm.so
#LoadModule authn_anon_module modules/mod_authn_anon.so
#LoadModule authn_dbd_module modules/mod_authn_dbd.so
#LoadModule authn_socache_module modules/mod_authn_socache.so
LoadModule authn_core_module modules/mod_authn_core.so
LoadModule authz_host_module modules/mod_authz_host.so
LoadModule authz_groupfile_module modules/mod_authz_groupfile.so
LoadModule authz_user_module modules/mod_authz_user.so
#LoadModule authz_dbm_module modules/mod_authz_dbm.so
#LoadModule authz_owner_module modules/mod_authz_owner.so
#LoadModule authz_dbd_module modules/mod_authz_dbd.so
LoadModule authz_core_module modules/mod_authz_core.so
#LoadModule authnz_ldap_module modules/mod_authnz_ldap.so
#LoadModule authnz_fcgi_module modules/mod_authnz_fcgi.so
LoadModule access_compat_module modules/mod_access_compat.so
LoadModule auth_basic_module modules/mod_auth_basic.so
#LoadModule auth_form_module modules/mod_auth_form.so
#LoadModule auth_digest_module modules/mod_auth_digest.so
#LoadModule allowmethods_module modules/mod_allowmethods.so
#LoadModule isapi_module modules/mod_isapi.so
#LoadModule file_cache_module modules/mod_file_cache.so
#LoadModule cache_module modules/mod_cache.so
#LoadModule cache_disk_module modules/mod_cache_disk.so
#LoadModule cache_socache_module modules/mod_cache_socache.so
#LoadModule socache_shmcb_module modules/mod_socache_shmcb.so
#LoadModule socache_dbm_module modules/mod_socache_dbm.so
#LoadModule socache_memcache_module modules/mod_socache_memcache.so
#LoadModule socache_redis_module modules/mod_socache_redis.so
#LoadModule watchdog_module modules/mod_watchdog.so
#LoadModule macro_module modules/mod_macro.so
#LoadModule dbd_module modules/mod_dbd.so
#LoadModule bucketeer_module modules/mod_bucketeer.so
#LoadModule dumpio_module modules/mod_dumpio.so
#LoadModule echo_module modules/mod_echo.so
#LoadModule example_hooks_module modules/mod_example_hooks.so
#LoadModule case_filter_module modules/mod_case_filter.so
#LoadModule case_filter_in_module modules/mod_case_filter_in.so
#LoadModule example_ipc_module modules/mod_example_ipc.so
#LoadModule buffer_module modules/mod_buffer.so
#LoadModule data_module modules/mod_data.so
#LoadModule ratelimit_module modules/mod_ratelimit.so
LoadModule reqtimeout_module modules/mod_reqtimeout.so
#LoadModule ext_filter_module modules/mod_ext_filter.so
#LoadModule request_module modules/mod_request.so
#LoadModule include_module modules/mod_include.so
LoadModule filter_module modules/mod_filter.so
#LoadModule reflector_module modules/mod_reflector.so
#LoadModule substitute_module modules/mod_substitute.so
#LoadModule sed_module modules/mod_sed.so
#LoadModule charset_lite_module modules/mod_charset_lite.so
#LoadModule deflate_module modules/mod_deflate.so
#LoadModule xml2enc_module modules/mod_xml2enc.so
#LoadModule proxy_html_module modules/mod_proxy_html.so
#LoadModule brotli_module modules/mod_brotli.so
LoadModule mime_module modules/mod_mime.so
#LoadModule ldap_module modules/mod_ldap.so
LoadModule log_config_module modules/mod_log_config.so
#LoadModule log_debug_module modules/mod_log_debug.so
#LoadModule log_forensic_module modules/mod_log_forensic.so
#LoadModule logio_module modules/mod_logio.so
#LoadModule lua_module modules/mod_lua.so
LoadModule env_module modules/mod_env.so
#LoadModule mime_magic_module modules/mod_mime_magic.so
#LoadModule cern_meta_module modules/mod_cern_meta.so
#LoadModule expires_module modules/mod_expires.so
LoadModule headers_module modules/mod_headers.so
#LoadModule ident_module modules/mod_ident.so
#LoadModule usertrack_module modules/mod_usertrack.so
#LoadModule unique_id_module modules/mod_unique_id.so
LoadModule setenvif_module modules/mod_setenvif.so
LoadModule version_module modules/mod_version.so
#LoadModule remoteip_module modules/mod_remoteip.so
#LoadModule proxy_module modules/mod_proxy.so
#LoadModule proxy_connect_module modules/mod_proxy_connect.so
#LoadModule proxy_ftp_module modules/mod_proxy_ftp.so
#LoadModule proxy_http_module modules/mod_proxy_http.so
#LoadModule proxy_fcgi_module modules/mod_proxy_fcgi.so
#LoadModule proxy_scgi_module modules/mod_proxy_scgi.so
#LoadModule proxy_uwsgi_module modules/mod_proxy_uwsgi.so
#LoadModule proxy_fdpass_module modules/mod_proxy_fdpass.so
#LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
#LoadModule proxy_ajp_module modules/mod_proxy_ajp.so
#LoadModule proxy_balancer_module modules/mod_proxy_balancer.so
#LoadModule proxy_express_module modules/mod_proxy_express.so
#LoadModule proxy_hcheck_module modules/mod_proxy_hcheck.so
#LoadModule session_module modules/mod_session.so
#LoadModule session_cookie_module modules/mod_session_cookie.so
#LoadModule session_crypto_module modules/mod_session_crypto.so
#LoadModule session_dbd_module modules/mod_session_dbd.so
#LoadModule slotmem_shm_module modules/mod_slotmem_shm.so
#LoadModule slotmem_plain_module modules/mod_slotmem_plain.so
#LoadModule ssl_module modules/mod_ssl.so
#LoadModule optional_hook_export_module modules/mod_optional_hook_export.so
#LoadModule optional_hook_import_module modules/mod_optional_hook_import.so
#LoadModule optional_fn_import_module modules/mod_optional_fn_import.so
#LoadModule optional_fn_export_module modules/mod_optional_fn_export.so
#LoadModule dialup_module modules/mod_dialup.so
#LoadModule http2_module modules/mod_http2.so
#LoadModule proxy_http2_module modules/mod_proxy_http2.so
#LoadModule md_module modules/mod_md.so
#LoadModule lbmethod_byrequests_module modules/mod_lbmethod_byrequests.so
#LoadModule lbmethod_bytraffic_module modules/mod_lbmethod_bytraffic.so
#LoadModule lbmethod_bybusyness_module modules/mod_lbmethod_bybusyness.so
#LoadModule lbmethod_heartbeat_module modules/mod_lbmethod_heartbeat.so
LoadModule unixd_module modules/mod_unixd.so
#LoadModule heartbeat_module modules/mod_heartbeat.so
#LoadModule heartmonitor_module modules/mod_heartmonitor.so
#LoadModule dav_module modules/mod_dav.so
LoadModule status_module modules/mod_status.so
LoadModule autoindex_module modules/mod_autoindex.so
#LoadModule asis_module modules/mod_asis.so
#LoadModule info_module modules/mod_info.so
#LoadModule suexec_module modules/mod_suexec.so
<IfModule !mpm_prefork_module>
    #LoadModule cgid_module modules/mod_cgid.so
</IfModule>
<IfModule mpm_prefork_module>
    #LoadModule cgi_module modules/mod_cgi.so
</IfModule>
#LoadModule dav_fs_module modules/mod_dav_fs.so
#LoadModule dav_lock_module modules/mod_dav_lock.so
#LoadModule vhost_alias_module modules/mod_vhost_alias.so
#LoadModule negotiation_module modules/mod_negotiation.so
LoadModule dir_module modules/mod_dir.so
#LoadModule imagemap_module modules/mod_imagemap.so
#LoadModule actions_module modules/mod_actions.so
#LoadModule speling_module modules/mod_speling.so
#LoadModule userdir_module modules/mod_userdir.so
LoadModule alias_module modules/mod_alias.so
#LoadModule rewrite_module modules/mod_rewrite.so

<IfModule unixd_module>
#
# If you wish httpd to run as a different user or group, you must run
# httpd as root initially and it will switch.  
#
# User/Group: The name (or #number) of the user/group to run httpd as.
# It is usually good practice to create a dedicated user and group for
# running httpd, as with most system services.
#
User www-data
Group www-data

</IfModule>

# 'Main' server configuration
#
# The directives in this section set up the values used by the 'main'
# server, which responds to any requests that aren't handled by a
# <VirtualHost> definition.  These values also provide defaults for
# any <VirtualHost> containers you may define later in the file.
#
# All of these directives may appear inside <VirtualHost> containers,
# in which case these default settings will be overridden for the
# virtual host being defined.
#

#
# ServerAdmin: Your address, where problems with the server should be
# e-mailed.  This address appears on some server-generated pages, such
# as error documents.  e.g. admin@your-domain.com
#
ServerAdmin webmaster@localhost

#
# ServerName gives the name and port that the server uses to identify itself.
# This can often be determined automatically, but we recommend you specify
# it explicitly to prevent problems during startup.
#
# If your host doesn't have a registered DNS name, enter its IP address here.
#
#ServerName www.example.com:80

#
# Deny access to the entirety of your server's filesystem. You must
# explicitly permit access to web content directories in other 
# <Directory> blocks below.
#
<Directory />
    AllowOverride none
    Require all denied
</Directory>

#
# Note that from this point forward you must specifically allow
# particular features to be enabled - so if something's not working as
# you might expect, make sure that you have specifically enabled it
# below.
#

#
# DocumentRoot: The directory out of which you will serve your
# documents. By default, all requests are taken from this directory, but
# symbolic links and aliases may be used to point to other locations.
#
#<Directory "/usr/local/apache2/htdocs">
    #
    # Possible values for the Options directive are "None", "All",
    # or any combination of:
    #   Indexes Includes FollowSymLinks SymLinksifOwnerMatch ExecCGI MultiViews
    #
    # Note that "MultiViews" must be named *explicitly* --- "Options All"
    # doesn't give it to you.
    #
    # The Options directive is both complicated and important.  Please see
    # http://httpd.apache.org/docs/2.4/mod/core.html#options
    # for more information.
    #
    #Options Indexes FollowSymLinks

    #
    # AllowOverride controls what directives may be placed in .htaccess files.
    # It can be "All", "None", or any combination of the keywords:
    #   AllowOverride FileInfo AuthConfig Limit
    #
    #AllowOverride None

    #
    # Controls who can get stuff from this server.
    #
    #Require all granted
#</Directory>

#
# DirectoryIndex: sets the file that Apache will serve if a directory
# is requested.
#
#<IfModule dir_module>
#    DirectoryIndex index.html
#</IfModule>

#
# The following lines prevent .htaccess and .htpasswd files from being 
# viewed by Web clients. 
#
<Files ".ht*">
    Require all denied
</Files>

#
# ErrorLog: The location of the error log file.
# If you do not specify an ErrorLog directive within a <VirtualHost>
# container, error messages relating to that virtual host will be
# logged here.  If you *do* define an error logfile for a <VirtualHost>
# container, that host's errors will be logged there and not here.
#
ErrorLog /proc/self/fd/2

#
# LogLevel: Control the number of messages logged to the error_log.
# Possible values include: debug, info, notice, warn, error, crit,
# alert, emerg.
#
LogLevel warn

#<IfModule log_config_module>
    #
    # The following directives define some format nicknames for use with
    # a CustomLog directive (see below).
    #
    #LogFormat "%h %l %u %t \\"%r\\" %>s %b \\"%{Referer}i\\" \\"%{User-Agent}i\\"" combined
    #LogFormat "%h %l %u %t \\"%r\\" %>s %b" common

    #<IfModule logio_module>
      # You need to enable mod_logio.c to use %I and %O
      #LogFormat "%h %l %u %t \\"%r\\" %>s %b \\"%{Referer}i\\" \\"%{User-Agent}i\\" %I %O" combinedio
    #</IfModule>

    #
    # The location and format of the access logfile (Common Logfile Format).
    # If you do not define any access logfiles within a <VirtualHost>
    # container, they will be logged here.  Contrariwise, if you *do*
    # define per-<VirtualHost> access logfiles, transactions will be
    # logged therein and *not* in this file.
    #
    #CustomLog /proc/self/fd/1 common

    #
    # If you prefer a logfile with access, agent, and referer information
    # (Combined Logfile Format) you can use the following directive.
    #
    #CustomLog "logs/access_log" combined
#</IfModule>

<IfModule alias_module>
    #
    # Redirect: Allows you to tell clients about documents that used to 
    # exist in your server's namespace, but do not anymore. The client 
    # will make a new request for the document at its new location.
    # Example:
    # Redirect permanent /foo http://www.example.com/bar

    #
    # Alias: Maps web paths into filesystem paths and is used to
    # access content that does not live under the DocumentRoot.
    # Example:
    # Alias /webpath /full/filesystem/path
    #
    # If you include a trailing / on /webpath then the server will
    # require it to be present in the URL.  You will also likely
    # need to provide a <Directory> section to allow access to
    # the filesystem path.

    #
    # ScriptAlias: This controls which directories contain server scripts. 
    # ScriptAliases are essentially the same as Aliases, except that
    # documents in the target directory are treated as applications and
    # run by the server when requested rather than as documents sent to the
    # client.  The same rules about trailing "/" apply to ScriptAlias
    # directives as to Alias.
    #
    ScriptAlias /cgi-bin/ "/usr/local/apache2/cgi-bin/"

</IfModule>

<IfModule cgid_module>
    #
    # ScriptSock: On threaded servers, designate the path to the UNIX
    # socket used to communicate with the CGI daemon of mod_cgid.
    #
    #Scriptsock cgisock
</IfModule>

#
# "/usr/local/apache2/cgi-bin" should be changed to whatever your ScriptAliased
# CGI directory exists, if you have that configured.
#
<Directory "/usr/local/apache2/cgi-bin">
    AllowOverride None
    Options None
    Require all granted
</Directory>

<IfModule headers_module>
    #
    # Avoid passing HTTP_PROXY environment to CGI's on this or any proxied
    # backend servers which have lingering "httpoxy" defects.
    # 'Proxy' request header is undefined by the IETF, not listed by IANA
    #
    RequestHeader unset Proxy early
</IfModule>

<IfModule mime_module>
    #
    # TypesConfig points to the file containing the list of mappings from
    # filename extension to MIME-type.
    #
    TypesConfig conf/mime.types

    #
    # AddType allows you to add to or override the MIME configuration
    # file specified in TypesConfig for specific file types.
    #
    #AddType application/x-gzip .tgz
    #
    # AddEncoding allows you to have certain browsers uncompress
    # information on the fly. Note: Not all browsers support this.
    #
    #AddEncoding x-compress .Z
    #AddEncoding x-gzip .gz .tgz
    #
    # If the AddEncoding directives above are commented-out, then you
    # probably should define those extensions to indicate media types:
    #
    AddType application/x-compress .Z
    AddType application/x-gzip .gz .tgz

    #
    # AddHandler allows you to map certain file extensions to "handlers":
    # actions unrelated to filetype. These can be either built into the server
    # or added with the Action directive (see below)
    #
    # To use CGI scripts outside of ScriptAliased directories:
    # (You will also need to add "ExecCGI" to the "Options" directive.)
    #
    #AddHandler cgi-script .cgi

    # For type maps (negotiated resources):
    #AddHandler type-map var

    #
    # Filters allow you to process content before it is sent to the client.
    #
    # To parse .shtml files for server-side includes (SSI):
    # (You will also need to add "Includes" to the "Options" directive.)
    #
    #AddType text/html .shtml
    #AddOutputFilter INCLUDES .shtml
</IfModule>

#
# The mod_mime_magic module allows the server to use various hints from the
# contents of the file itself to determine its type.  The MIMEMagicFile
# directive tells the module where the hint definitions are located.
#
#MIMEMagicFile conf/magic

#
# Customizable error responses come in three flavors:
# 1) plain text 2) local redirects 3) external redirects
#
# Some examples:
#ErrorDocument 500 "The server made a boo boo."
#ErrorDocument 404 /missing.html
#ErrorDocument 404 "/cgi-bin/missing_handler.pl"
#ErrorDocument 402 http://www.example.com/subscription_info.html
#

#
# MaxRanges: Maximum number of Ranges in a request before
# returning the entire resource, or one of the special
# values 'default', 'none' or 'unlimited'.
# Default setting is to accept 200 Ranges.
#MaxRanges unlimited

#
# EnableMMAP and EnableSendfile: On systems that support it, 
# memory-mapping or the sendfile syscall may be used to deliver
# files.  This usually improves server performance, but must
# be turned off when serving from networked-mounted 
# filesystems or if support for these functions is otherwise
# broken on your system.
# Defaults: EnableMMAP On, EnableSendfile Off
#
#EnableMMAP off
#EnableSendfile on

# Supplemental configuration
#
# The configuration files in the conf/extra/ directory can be 
# included to add extra features or to modify the default configuration of 
# the server, or you may simply copy their contents here and change as 
# necessary.

# Server-pool management (MPM specific)
#Include conf/extra/httpd-mpm.conf

# Multi-language error messages
#Include conf/extra/httpd-multilang-errordoc.conf

# Fancy directory listings
#Include conf/extra/httpd-autoindex.conf

# Language settings
#Include conf/extra/httpd-languages.conf

# User home directories
#Include conf/extra/httpd-userdir.conf

# Real-time info on requests and configuration
#Include conf/extra/httpd-info.conf

# Virtual hosts
#Include conf/extra/httpd-vhosts.conf

# Local access to the Apache HTTP Server Manual
#Include conf/extra/httpd-manual.conf

# Distributed authoring and versioning (WebDAV)
#Include conf/extra/httpd-dav.conf

# Various default settings
#Include conf/extra/httpd-default.conf

# Configure mod_proxy_html to understand HTML4/XHTML1
<IfModule proxy_html_module>
Include conf/extra/proxy-html.conf
</IfModule>

# Secure (SSL/TLS) connections
#Include conf/extra/httpd-ssl.conf
#
# Note: The following must must be present to support
#       starting without SSL on platforms with no /dev/random equivalent
#       but a statically compiled-in mod_ssl.
#
<IfModule ssl_module>
SSLRandomSeed startup builtin
SSLRandomSeed connect builtin
</IfModule>

LogFormat "%v:%p %h %l %u %t \\"%r\\" %>s %O \\"%{Referer}i\\" \\"%{User-Agent}i\\"" vhost_combined
LogFormat "%h %l %u %t \\"%r\\" %>s %O \\"%{Referer}i\\" \\"%{User-Agent}i\\"" combined
LogFormat "%h %l %u %t \\"%r\\" %>s %O" common
LogFormat "%{Referer}i -> %U" referer
LogFormat "%{User-agent}i" agent

<VirtualHost *:80>
    DocumentRoot "/usr/local/apache2/htdocs"
    ScriptAlias "/cgi-bin/" "/usr/local/apache2/cgi-bin/"
    ServerName _default_
    ProxyPass /phpmyadmin/ http://172.0.0.1:8080/
    ProxyPassReverse /phpmyadmin/ http://172.0.0.1:8080/
    <Directory "/var/www/html/">
        AllowOverride All
        Options FollowSymLinks Indexes 
        Require all granted
    </Directory>
</VirtualHost>`;
    const apache2charset = `# Read the documentation before enabling AddDefaultCharset.
# In general, it is only a good idea if you know that all your files
# have this encoding. It will override any encoding given in the files
# in meta http-equiv or xml encoding tags.

#AddDefaultCharset UTF-8`;
    const apache2localizederrorpages = `# Customizable error responses come in three flavors:
# 1) plain text
# 2) local redirects
# 3) external redirects
#
# Some examples:
#ErrorDocument 500 "The server made a boo boo."
#ErrorDocument 404 /missing.html
#ErrorDocument 404 "/cgi-bin/missing_handler.pl"
#ErrorDocument 402 http://www.example.com/subscription_info.html
#

#
# Putting this all together, we can internationalize error responses.
#
# We use Alias to redirect any /error/HTTP_<error>.html.var response to
# our collection of by-error message multi-language collections.  We use
# includes to substitute the appropriate text.
#
# You can modify the messages' appearance without changing any of the
# default HTTP_<error>.html.var files by adding the line:
#
#Alias /error/include/ "/your/include/path/"
#
# which allows you to create your own set of files by starting with the
# /usr/share/apache2/error/include/ files and copying them to /your/include/path/,
# even on a per-VirtualHost basis.  If you include the Alias in the global server
# context, is has to come _before_ the 'Alias /error/ ...' line.
#
# The default include files will display your Apache version number and your
# ServerAdmin email address regardless of the setting of ServerSignature.
#
# WARNING: The configuration below will NOT work out of the box if you have a
#		  SetHandler directive in a <Location /> context somewhere. Adding
#		  the following three lines AFTER the <Location /> context should
#		  make it work in most cases:
#		  <Location /error/>
#			 SetHandler none
#		  </Location>
#
# The internationalized error documents require mod_alias, mod_include
# and mod_negotiation.  To activate them, uncomment the following 37 lines.

#<IfModule mod_negotiation.c>
#	<IfModule mod_include.c>
#		<IfModule mod_alias.c>
#
#			Alias /error/ "/usr/share/apache2/error/"
#
#			<Directory "/usr/share/apache2/error">
#				Options IncludesNoExec
#				AddOutputFilter Includes html
#				AddHandler type-map var
#				Order allow,deny
#				Allow from all
#				LanguagePriority en cs de es fr it nl sv pt-br ro
#				ForceLanguagePriority Prefer Fallback
#			</Directory>
#
#			ErrorDocument 400 /error/HTTP_BAD_REQUEST.html.var
#			ErrorDocument 401 /error/HTTP_UNAUTHORIZED.html.var
#			ErrorDocument 403 /error/HTTP_FORBIDDEN.html.var
#			ErrorDocument 404 /error/HTTP_NOT_FOUND.html.var
#			ErrorDocument 405 /error/HTTP_METHOD_NOT_ALLOWED.html.var
#			ErrorDocument 408 /error/HTTP_REQUEST_TIME_OUT.html.var
#			ErrorDocument 410 /error/HTTP_GONE.html.var
#			ErrorDocument 411 /error/HTTP_LENGTH_REQUIRED.html.var
#			ErrorDocument 412 /error/HTTP_PRECONDITION_FAILED.html.var
#			ErrorDocument 413 /error/HTTP_REQUEST_ENTITY_TOO_LARGE.html.var
#			ErrorDocument 414 /error/HTTP_REQUEST_URI_TOO_LARGE.html.var
#			ErrorDocument 415 /error/HTTP_UNSUPPORTED_MEDIA_TYPE.html.var
#			ErrorDocument 500 /error/HTTP_INTERNAL_SERVER_ERROR.html.var
#			ErrorDocument 501 /error/HTTP_NOT_IMPLEMENTED.html.var
#			ErrorDocument 502 /error/HTTP_BAD_GATEWAY.html.var
#			ErrorDocument 503 /error/HTTP_SERVICE_UNAVAILABLE.html.var
#			ErrorDocument 506 /error/HTTP_VARIANT_ALSO_VARIES.html.var
#		</IfModule>
#	</IfModule>
#</IfModule>`;
    const apache2othervhostsaccesslog = `# Define an access log for VirtualHosts that don't define their own logfile
CustomLog \${APACHE_LOG_DIR}/other_vhosts_access.log vhost_combined`;
    const apache2security = `# Changing the following options will not really affect the security of the
# server, but might make attacks slightly more difficult in some cases.

#
# ServerTokens
# This directive configures what you return as the Server HTTP response
# Header. The default is 'Full' which sends information about the OS-Type
# and compiled in modules.
# Set to one of:  Full | OS | Minimal | Minor | Major | Prod
# where Full conveys the most information, and Prod the least.
#ServerTokens Minimal
ServerTokens OS
#ServerTokens Full

#
# Optionally add a line containing the server version and virtual host
# name to server-generated pages (internal error documents, FTP directory
# listings, mod_status and mod_info output etc., but not CGI generated
# documents or custom error documents).
# Set to "EMail" to also include a mailto: link to the ServerAdmin.
# Set to one of:  On | Off | EMail
#ServerSignature Off
ServerSignature On

#
# Allow TRACE method
#
# Set to "extended" to also reflect the request body (only for testing and
# diagnostic purposes).
#
# Set to one of:  On | Off | extended
TraceEnable Off
#TraceEnable On

#
# Forbid access to version control directories
#
# If you use version control systems in your document root, you should
# probably deny access to their directories.
#
# Examples:
#
#RedirectMatch 404 /\.git
#RedirectMatch 404 /\.svn

#
# Setting this header will prevent MSIE from interpreting files as something
# else than declared by the content type in the HTTP headers.
# Requires mod_headers to be enabled.
#
#Header set X-Content-Type-Options: "nosniff"

#
# Setting this header will prevent other sites from embedding pages from this
# site as frames. This defends against clickjacking attacks.
# Requires mod_headers to be enabled.
#
#Header set Content-Security-Policy "frame-ancestors 'self';"`;
    const apache2servecgibin = `<IfModule mod_alias.c>
<IfModule mod_cgi.c>
	Define ENABLE_USR_LIB_CGI_BIN
</IfModule>

<IfModule mod_cgid.c>
	Define ENABLE_USR_LIB_CGI_BIN
</IfModule>

<IfDefine ENABLE_USR_LIB_CGI_BIN>
	ScriptAlias /cgi-bin/ /usr/lib/cgi-bin/
	<Directory "/usr/lib/cgi-bin">
		AllowOverride None
		Options +ExecCGI -MultiViews +SymLinksIfOwnerMatch
		Require all granted
	</Directory>
</IfDefine>
</IfModule>`;
    const apache2default = `<VirtualHost *:80>
# The ServerName directive sets the request scheme, hostname and port that
# the server uses to identify itself. This is used when creating
# redirection URLs. In the context of virtual hosts, the ServerName
# specifies what hostname must appear in the request's Host: header to
# match this virtual host. For the default virtual host (this file) this
# value is not decisive as it is used as a last resort host regardless.
# However, you must set it for any further virtual host explicitly.
#ServerName www.example.com

ServerAdmin webmaster@localhost
DocumentRoot /var/www/html

# Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
# error, crit, alert, emerg.
# It is also possible to configure the loglevel for particular
# modules, e.g.
#LogLevel info ssl:warn

ErrorLog \${APACHE_LOG_DIR}/error.log
CustomLog \${APACHE_LOG_DIR}/access.log combined

# For most configuration files from conf-available/, which are
# enabled or disabled at a global level, it is possible to
# include a line for only one particular virtual host. For example the
# following line enables the CGI configuration for this host only
# after it has been globally disabled with "a2disconf".
#Include conf-available/serve-cgi-bin.conf
</VirtualHost>`;
    const apache2defaultssl = `<VirtualHost *:443>
ServerAdmin webmaster@localhost

DocumentRoot /var/www/html

# Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
# error, crit, alert, emerg.
# It is also possible to configure the loglevel for particular
# modules, e.g.
#LogLevel info ssl:warn

ErrorLog \${APACHE_LOG_DIR}/error.log
CustomLog \${APACHE_LOG_DIR}/access.log combined

# For most configuration files from conf-available/, which are
# enabled or disabled at a global level, it is possible to
# include a line for only one particular virtual host. For example the
# following line enables the CGI configuration for this host only
# after it has been globally disabled with "a2disconf".
#Include conf-available/serve-cgi-bin.conf

#   SSL Engine Switch:
#   Enable/Disable SSL for this virtual host.
SSLEngine on

#   A self-signed (snakeoil) certificate can be created by installing
#   the ssl-cert package. See
#   /usr/share/doc/apache2/README.Debian.gz for more info.
#   If both key and certificate are stored in the same file, only the
#   SSLCertificateFile directive is needed.
SSLCertificateFile      /etc/ssl/certs/ssl-cert-snakeoil.pem
SSLCertificateKeyFile   /etc/ssl/private/ssl-cert-snakeoil.key

#   Server Certificate Chain:
#   Point SSLCertificateChainFile at a file containing the
#   concatenation of PEM encoded CA certificates which form the
#   certificate chain for the server certificate. Alternatively
#   the referenced file can be the same as SSLCertificateFile
#   when the CA certificates are directly appended to the server
#   certificate for convinience.
#SSLCertificateChainFile /etc/apache2/ssl.crt/server-ca.crt

#   Certificate Authority (CA):
#   Set the CA certificate verification path where to find CA
#   certificates for client authentication or alternatively one
#   huge file containing all of them (file must be PEM encoded)
#   Note: Inside SSLCACertificatePath you need hash symlinks
#	  to point to the certificate files. Use the provided
#	  Makefile to update the hash symlinks after changes.
#SSLCACertificatePath /etc/ssl/certs/
#SSLCACertificateFile /etc/apache2/ssl.crt/ca-bundle.crt

#   Certificate Revocation Lists (CRL):
#   Set the CA revocation path where to find CA CRLs for client
#   authentication or alternatively one huge file containing all
#   of them (file must be PEM encoded)
#   Note: Inside SSLCARevocationPath you need hash symlinks
#	  to point to the certificate files. Use the provided
#	  Makefile to update the hash symlinks after changes.
#SSLCARevocationPath /etc/apache2/ssl.crl/
#SSLCARevocationFile /etc/apache2/ssl.crl/ca-bundle.crl

#   Client Authentication (Type):
#   Client certificate verification type and depth.  Types are
#   none, optional, require and optional_no_ca.  Depth is a
#   number which specifies how deeply to verify the certificate
#   issuer chain before deciding the certificate is not valid.
#SSLVerifyClient require
#SSLVerifyDepth  10

#   SSL Engine Options:
#   Set various options for the SSL engine.
#   o FakeBasicAuth:
#    Translate the client X.509 into a Basic Authorisation.  This means that
#    the standard Auth/DBMAuth methods can be used for access control.  The
#    user name is the \`one line' version of the client's X.509 certificate.
#    Note that no password is obtained from the user. Every entry in the user
#    file needs this password: \`xxj31ZMTZzkVA'.
#   o ExportCertData:
#    This exports two additional environment variables: SSL_CLIENT_CERT and
#    SSL_SERVER_CERT. These contain the PEM-encoded certificates of the
#    server (always existing) and the client (only existing when client
#    authentication is used). This can be used to import the certificates
#    into CGI scripts.
#   o StdEnvVars:
#    This exports the standard SSL/TLS related \`SSL_*' environment variables.
#    Per default this exportation is switched off for performance reasons,
#    because the extraction step is an expensive operation and is usually
#    useless for serving static content. So one usually enables the
#    exportation for CGI and SSI requests only.
#   o OptRenegotiate:
#    This enables optimized SSL connection renegotiation handling when SSL
#    directives are used in per-directory context.
#SSLOptions +FakeBasicAuth +ExportCertData +StrictRequire
<FilesMatch "\\.(?:cgi|shtml|phtml|php)$">
	SSLOptions +StdEnvVars
</FilesMatch>
<Directory /usr/lib/cgi-bin>
	SSLOptions +StdEnvVars
</Directory>

#   SSL Protocol Adjustments:
#   The safe and default but still SSL/TLS standard compliant shutdown
#   approach is that mod_ssl sends the close notify alert but doesn't wait for
#   the close notify alert from client. When you need a different shutdown
#   approach you can use one of the following variables:
#   o ssl-unclean-shutdown:
#    This forces an unclean shutdown when the connection is closed, i.e. no
#    SSL close notify alert is send or allowed to received.  This violates
#    the SSL/TLS standard but is needed for some brain-dead browsers. Use
#    this when you receive I/O errors because of the standard approach where
#    mod_ssl sends the close notify alert.
#   o ssl-accurate-shutdown:
#    This forces an accurate shutdown when the connection is closed, i.e. a
#    SSL close notify alert is send and mod_ssl waits for the close notify
#    alert of the client. This is 100% SSL/TLS standard compliant, but in
#    practice often causes hanging connections with brain-dead browsers. Use
#    this only for browsers where you know that their SSL implementation
#    works correctly.
#   Notice: Most problems of broken clients are also related to the HTTP
#   keep-alive facility, so you usually additionally want to disable
#   keep-alive for those clients, too. Use variable "nokeepalive" for this.
#   Similarly, one has to force some clients to use HTTP/1.0 to workaround
#   their broken HTTP/1.1 implementation. Use variables "downgrade-1.0" and
#   "force-response-1.0" for this.
# BrowserMatch "MSIE [2-6]" \\
#	nokeepalive ssl-unclean-shutdown \\
#	downgrade-1.0 force-response-1.0

</VirtualHost>`;
    const apache2conf = `# This is the main Apache server configuration file.  It contains the
# configuration directives that give the server its instructions.
# See http://httpd.apache.org/docs/2.4/ for detailed information about
# the directives and /usr/share/doc/apache2/README.Debian about Debian specific
# hints.
#
#
# Summary of how the Apache 2 configuration works in Debian:
# The Apache 2 web server configuration in Debian is quite different to
# upstream's suggested way to configure the web server. This is because Debian's
# default Apache2 installation attempts to make adding and removing modules,
# virtual hosts, and extra configuration directives as flexible as possible, in
# order to make automating the changes and administering the server as easy as
# possible.

# It is split into several files forming the configuration hierarchy outlined
# below, all located in the /etc/apache2/ directory:
#
#       /etc/apache2/
#       |-- apache2.conf
#       |       \`--  ports.conf
#       |-- mods-enabled
#       |       |-- *.load
#       |       \`-- *.conf
#       |-- conf-enabled
#       |       \`-- *.conf
#       \`-- sites-enabled
#               \`-- *.conf
#
#
# * apache2.conf is the main configuration file (this file). It puts the pieces
#   together by including all remaining configuration files when starting up the
#   web server.
#
# * ports.conf is always included from the main configuration file. It is
#   supposed to determine listening ports for incoming connections which can be
#   customized anytime.
#
# * Configuration files in the mods-enabled/, conf-enabled/ and sites-enabled/
#   directories contain particular configuration snippets which manage modules,
#   global configuration fragments, or virtual host configurations,
#   respectively.
#
#   They are activated by symlinking available configuration files from their
#   respective *-available/ counterparts. These should be managed by using our
#   helpers a2enmod/a2dismod, a2ensite/a2dissite and a2enconf/a2disconf. See
#   their respective man pages for detailed information.
#
# * The binary is called apache2. Due to the use of environment variables, in
#   the default configuration, apache2 needs to be started/stopped with
#   /etc/init.d/apache2 or apache2ctl. Calling /usr/bin/apache2 directly will not
#   work with the default configuration.


# Global configuration
#

#
# ServerRoot: The top of the directory tree under which the server's
# configuration, error, and log files are kept.
#
# NOTE!  If you intend to place this on an NFS (or otherwise network)
# mounted filesystem then please read the Mutex documentation (available
# at <URL:http://httpd.apache.org/docs/2.4/mod/core.html#mutex>);
# you will save yourself a lot of trouble.
#
# Do NOT add a slash at the end of the directory path.
#
#ServerRoot "/etc/apache2"

#
# The accept serialization lock file MUST BE STORED ON A LOCAL DISK.
#
#Mutex file:\${APACHE_LOCK_DIR} default

#
# The directory where shm and other runtime files will be stored.
#

DefaultRuntimeDir \${APACHE_RUN_DIR}

#
# PidFile: The file in which the server should record its process
# identification number when it starts.
# This needs to be set in /etc/apache2/envvars
#
PidFile \${APACHE_PID_FILE}

#
# Timeout: The number of seconds before receives and sends time out.
#
Timeout 300

#
# KeepAlive: Whether or not to allow persistent connections (more than
# one request per connection). Set to "Off" to deactivate.
#
KeepAlive On

#
# MaxKeepAliveRequests: The maximum number of requests to allow
# during a persistent connection. Set to 0 to allow an unlimited amount.
# We recommend you leave this number high, for maximum performance.
#
MaxKeepAliveRequests 100

#
# KeepAliveTimeout: Number of seconds to wait for the next request from the
# same client on the same connection.
#
KeepAliveTimeout 5


# These need to be set in /etc/apache2/envvars
User \${APACHE_RUN_USER}
Group \${APACHE_RUN_GROUP}

#
# HostnameLookups: Log the names of clients or just their IP addresses
# e.g., www.apache.org (on) or 204.62.129.132 (off).
# The default is off because it'd be overall better for the net if people
# had to knowingly turn this feature on, since enabling it means that
# each client request will result in AT LEAST one lookup request to the
# nameserver.
#
HostnameLookups Off

# ErrorLog: The location of the error log file.
# If you do not specify an ErrorLog directive within a <VirtualHost>
# container, error messages relating to that virtual host will be
# logged here.  If you *do* define an error logfile for a <VirtualHost>
# container, that host's errors will be logged there and not here.
#
ErrorLog \${APACHE_LOG_DIR}/error.log

#
# LogLevel: Control the severity of messages logged to the error_log.
# Available values: trace8, ..., trace1, debug, info, notice, warn,
# error, crit, alert, emerg.
# It is also possible to configure the log level for particular modules, e.g.
# "LogLevel info ssl:warn"
#
LogLevel warn

# Include module configuration:
IncludeOptional mods-enabled/*.load
IncludeOptional mods-enabled/*.conf

# Include list of ports to listen on
Include ports.conf


# Sets the default security model of the Apache2 HTTPD server. It does
# not allow access to the root filesystem outside of /usr/share and /var/www.
# The former is used by web applications packaged in Debian,
# the latter may be used for local directories served by the web server. If
# your system is serving content from a sub-directory in /srv you must allow
# access here, or in any related virtual host.
<Directory />
        Options FollowSymLinks
        AllowOverride None
        Require all denied
</Directory>

<Directory /usr/share>
        AllowOverride None
        Require all granted
</Directory>

<Directory /var/www/>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
</Directory>


#<Directory /srv/>
#       Options Indexes FollowSymLinks
#       AllowOverride None
#       Require all granted
#</Directory>




# AccessFileName: The name of the file to look for in each directory
# for additional configuration directives.  See also the AllowOverride
# directive.
#
AccessFileName .htaccess

#
# The following lines prevent .htaccess and .htpasswd files from being
# viewed by Web clients.
#
<FilesMatch "^\.ht">
        Require all denied
</FilesMatch>


#
# The following directives define some format nicknames for use with
# a CustomLog directive.
#
# These deviate from the Common Log Format definitions in that they use %O
# (the actual bytes sent including headers) instead of %b (the size of the
# requested file), because the latter makes it impossible to detect partial
# requests.
#
# Note that the use of %{X-Forwarded-For}i instead of %h is not recommended.
# Use mod_remoteip instead.
#
LogFormat "%v:%p %h %l %u %t \\"%r\\" %>s %O \\"%{Referer}i\\" \\"%{User-Agent}i\\"" vhost_combined
LogFormat "%h %l %u %t \\"%r\\" %>s %O \\"%{Referer}i\\" \\"%{User-Agent}i\\"" combined
LogFormat "%h %l %u %t \\"%r\\" %>s %O" common
LogFormat "%{Referer}i -> %U" referer
LogFormat "%{User-agent}i" agent

# Include of directories ignores editors' and dpkg's backup files,
# see README.Debian for details.

<VirtualHost *:80>
    DocumentRoot "/var/www/html/"
    ServerName "localhost"
        ScriptAlias /cgi-bin/ /var/www/cgi-bin/
    Alias "/mysql/" "/var/www/phpmyadmin/"
    Alias "/mysql" "/var/www/phpmyadmin/"
        Alias "/phpmyadmin/" "/var/www/phpmyadmin/"
        Alias "/phpmyadmin" "/var/www/phpmyadmin/"
    <Directory "/var/www/phpmyadmin/">
        AllowOverride All
        Options FollowSymLinks Includes Indexes 
        Require all granted
        </Directory>
    <Directory "/var/www/html/">
        AllowOverride All
            Options FollowSymLinks Indexes 
        Require all granted
    </Directory>
</VirtualHost>`;
    const apache2envvars = `# envvars - default environment variables for apache2ctl

# this won't be correct after changing uid
unset HOME

# for supporting multiple apache2 instances
if [ "\${APACHE_CONFDIR##/etc/apache2-}" != "\${APACHE_CONFDIR}" ] ; then
    SUFFIX="-\${APACHE_CONFDIR##/etc/apache2-}"
else
    SUFFIX=
fi

# Since there is no sane way to get the parsed apache2 config in scripts, some
# settings are defined via environment variables and then used in apache2ctl,
# /etc/init.d/apache2, /etc/logrotate.d/apache2, etc.
export APACHE_RUN_USER=www-data
export APACHE_RUN_GROUP=www-data
# temporary state file location. This might be changed to /run in Wheezy+1
export APACHE_PID_FILE=/var/run/apache2$SUFFIX/apache2.pid
export APACHE_RUN_DIR=/var/run/apache2$SUFFIX
export APACHE_LOCK_DIR=/var/lock/apache2$SUFFIX
# Only /var/log/apache2 is handled by /etc/logrotate.d/apache2.
export APACHE_LOG_DIR=/var/log/apache2$SUFFIX

## The locale used by some modules like mod_dav
export LANG=C
## Uncomment the following line to use the system default locale instead:
#. /etc/default/locale

export LANG

## The command to get the status for 'apache2ctl status'.
## Some packages providing 'www-browser' need '--dump' instead of '-dump'.
#export APACHE_LYNX='www-browser -dump'

## If you need a higher file descriptor limit, uncomment and adjust the
## following line (default is 8192):
#APACHE_ULIMIT_MAX_FILES='ulimit -n 65536'

## If you would like to pass arguments to the web server, add them below
## to the APACHE_ARGUMENTS environment.
#export APACHE_ARGUMENTS=''

## Enable the debug mode for maintainer scripts.
## This will produce a verbose output on package installations of web server modules and web application
## installations which interact with Apache
#export APACHE2_MAINTSCRIPT_DEBUG=1`;
    const apache2magic = `# Magic data for mod_mime_magic (originally for file(1) command)
#
# The format is 4-5 columns:
#    Column #1: byte number to begin checking from, ">" indicates continuation
#    Column #2: type of data to match
#    Column #3: contents of data to match
#    Column #4: MIME type of result
#    Column #5: MIME encoding of result (optional)

#------------------------------------------------------------------------------
# Localstuff:  file(1) magic for locally observed files
# Add any locally observed files here.

# Real Audio (Magic .ra\\0375)
0	belong		0x2e7261fd	audio/x-pn-realaudio
0	string		.RMF		application/vnd.rn-realmedia

#video/x-pn-realvideo
#video/vnd.rn-realvideo
#application/vnd.rn-realmedia
#	sigh, there are many mimes for that but the above are the most common.

# Taken from magic, converted to magic.mime
# mime types according to http://www.geocities.com/nevilo/mod.htm:
#	audio/it	.it
#	audio/x-zipped-it	.itz
#	audio/xm	fasttracker modules
#	audio/x-s3m	screamtracker modules
#	audio/s3m	screamtracker modules
#	audio/x-zipped-mod	mdz
#	audio/mod	mod
#	audio/x-mod	All modules (mod, s3m, 669, mtm, med, xm, it, mdz, stm, itz, xmz, s3z)

# Taken from loader code from mikmod version 2.14
# by Steve McIntyre (stevem@chiark.greenend.org.uk)
# <doj@cubic.org> added title printing on 2003-06-24
0	string	MAS_UTrack_V00
>14	string	>/0		audio/x-mod
#audio/x-tracker-module

#0	string	UN05		MikMod UNI format module sound data

0	string	Extended\\ Module: audio/x-mod
#audio/x-tracker-module
##>17	string	>\\0		Title: "%s"

21	string/c	\\!SCREAM!	audio/x-mod
#audio/x-screamtracker-module
21	string	BMOD2STM	audio/x-mod
#audio/x-screamtracker-module
1080	string	M.K.		audio/x-mod
#audio/x-protracker-module
#>0	string	>\\0		Title: "%s"
1080	string	M!K!		audio/x-mod
#audio/x-protracker-module
#>0	string	>\\0		Title: "%s"
1080	string	FLT4		audio/x-mod
#audio/x-startracker-module
#>0	string	>\\0		Title: "%s"
1080	string	FLT8		audio/x-mod
#audio/x-startracker-module
#>0	string	>\\0		Title: "%s"
1080	string	4CHN		audio/x-mod
#audio/x-fasttracker-module
#>0	string	>\\0		Title: "%s"
1080	string	6CHN		audio/x-mod
#audio/x-fasttracker-module
#>0	string	>\\0		Title: "%s"
1080	string	8CHN		audio/x-mod
#audio/x-fasttracker-module
#>0	string	>\\0		Title: "%s"
1080	string	CD81		audio/x-mod
#audio/x-oktalyzer-tracker-module
#>0	string	>\\0		Title: "%s"
1080	string	OKTA		audio/x-mod
#audio/x-oktalyzer-tracker-module
#>0	string	>\\0		Title: "%s"
# Not good enough.
#1082	string	CH
#>1080	string	>/0		%.2s-channel Fasttracker "oktalyzer" module sound data
1080	string	16CN		audio/x-mod
#audio/x-taketracker-module
#>0	string	>\\0		Title: "%s"
1080	string	32CN		audio/x-mod
#audio/x-taketracker-module
#>0	string	>\\0		Title: "%s"

# Impuse tracker module (it)
0	string		IMPM		audio/x-mod
#>4	string		>\\0		"%s"
#>40	leshort		!0		compatible w/ITv%x
#>42	leshort		!0		created w/ITv%x

#------------------------------------------------------------------------------
# end local stuff
#------------------------------------------------------------------------------

# xml based formats!

# svg

0	string		\\<?xml
#			text/xml
>38	string		\\<\\!DOCTYPE\\040svg	image/svg+xml


# xml
0	string		\\<?xml			text/xml


#------------------------------------------------------------------------------
# Java

0	short		0xcafe
>2	short		0xbabe		application/java

#------------------------------------------------------------------------------
# audio:  file(1) magic for sound formats
#
# from Jan Nicolai Langfeldt <janl@ifi.uio.no>,
#

# Sun/NeXT audio data
0	string		.snd
>12	belong		1		audio/basic
>12	belong		2		audio/basic
>12	belong		3		audio/basic
>12	belong		4		audio/basic
>12	belong		5		audio/basic
>12	belong		6		audio/basic
>12	belong		7		audio/basic

>12	belong		23		audio/x-adpcm

# DEC systems (e.g. DECstation 5000) use a variant of the Sun/NeXT format
# that uses little-endian encoding and has a different magic number
# (0x0064732E in little-endian encoding).
0	lelong		0x0064732E	
>12	lelong		1		audio/x-dec-basic
>12	lelong		2		audio/x-dec-basic
>12	lelong		3		audio/x-dec-basic
>12	lelong		4		audio/x-dec-basic
>12	lelong		5		audio/x-dec-basic
>12	lelong		6		audio/x-dec-basic
>12	lelong		7		audio/x-dec-basic
#                                       compressed (G.721 ADPCM)
>12	lelong		23		audio/x-dec-adpcm

# Bytes 0-3 of AIFF, AIFF-C, & 8SVX audio files are "FORM"
#					AIFF audio data
8	string		AIFF		audio/x-aiff	
#					AIFF-C audio data
8	string		AIFC		audio/x-aiff	
#					IFF/8SVX audio data
8	string		8SVX		audio/x-aiff	



# Creative Labs AUDIO stuff
#					Standard MIDI data
0	string	MThd			audio/unknown	
#>9 	byte	>0			(format %d)
#>11	byte	>1			using %d channels
#					Creative Music (CMF) data
0	string	CTMF			audio/unknown	
#					SoundBlaster instrument data
0	string	SBI			audio/unknown	
#					Creative Labs voice data
0	string	Creative\\ Voice\\ File	audio/unknown	
## is this next line right?  it came this way...
#>19	byte	0x1A
#>23	byte	>0			- version %d
#>22	byte	>0			\\b.%d

# [GRR 950115:  is this also Creative Labs?  Guessing that first line
#  should be string instead of unknown-endian long...]
#0	long		0x4e54524b	MultiTrack sound data
#0	string		NTRK		MultiTrack sound data
#>4	long		x		- version %ld

# Microsoft WAVE format (*.wav)
# [GRR 950115:  probably all of the shorts and longs should be leshort/lelong]
#					Microsoft RIFF
0	string		RIFF
#					- WAVE format
>8	string		WAVE		audio/x-wav
>8	string/B	AVI		video/x-msvideo
#
>8 	string		CDRA		image/x-coreldraw

# AAC (aka MPEG-2 NBC)
0       beshort&0xfff6    0xfff0          audio/X-HX-AAC-ADTS
0       string          ADIF            audio/X-HX-AAC-ADIF
0       beshort&0xffe0  0x56e0          audio/MP4A-LATM
0       beshort         0x4De1          audio/MP4A-LATM

# MPEG Layer 3 sound files
0       beshort&0xfffe  =0xfffa         audio/mpeg
#MP3 with ID3 tag
0	string		ID3		audio/mpeg
# Ogg/Vorbis
0	string		OggS		application/ogg

#------------------------------------------------------------------------------
# c-lang:  file(1) magic for C programs or various scripts
#

# XPM icons (Greg Roelofs, newt@uchicago.edu)
# ideally should go into "images", but entries below would tag XPM as C source
0	string		/*\\ XPM		image/x-xpmi 7bit

# 3DS (3d Studio files)
#16	beshort		0x3d3d		image/x-3ds

# this first will upset you if you're a PL/1 shop... (are there any left?)
# in which case rm it; ascmagic will catch real C programs
#					C or REXX program text
#0	string		/*		text/x-c
#					C++ program text
#0	string		//		text/x-c++

#------------------------------------------------------------------------------
# commands:  file(1) magic for various shells and interpreters
#
#0       string          :\\ shell archive or commands for antique kernel text
0       string          #!/bin/sh               application/x-shellscript
0       string          #!\\ /bin/sh             application/x-shellscript
0       string          #!/bin/csh              application/x-shellscript
0       string          #!\\ /bin/csh            application/x-shellscript
# korn shell magic, sent by George Wu, gwu@clyde.att.com
0       string          #!/bin/ksh              application/x-shellscript
0       string          #!\\ /bin/ksh            application/x-shellscript
0       string          #!/bin/tcsh             application/x-shellscript
0       string          #!\\ /bin/tcsh           application/x-shellscript
0       string          #!/usr/local/tcsh       application/x-shellscript
0       string          #!\\ /usr/local/tcsh     application/x-shellscript
0       string          #!/usr/local/bin/tcsh   application/x-shellscript
0       string          #!\\ /usr/local/bin/tcsh application/x-shellscript
# bash shell magic, from Peter Tobias (tobias@server.et-inf.fho-emden.de)
0       string          #!/bin/bash     		application/x-shellscript
0       string          #!\\ /bin/bash           application/x-shellscript
0       string          #!/usr/local/bin/bash   application/x-shellscript
0       string          #!\\ /usr/local/bin/bash application/x-shellscript

#
# zsh/ash/ae/nawk/gawk magic from cameron@cs.unsw.oz.au (Cameron Simpson)
0       string          #!/bin/zsh	        application/x-shellscript
0       string          #!/usr/bin/zsh	        application/x-shellscript
0       string          #!/usr/local/bin/zsh    application/x-shellscript
0       string          #!\\ /usr/local/bin/zsh  application/x-shellscript
0       string          #!/usr/local/bin/ash    application/x-shellscript
0       string          #!\\ /usr/local/bin/ash  application/x-shellscript
#0       string          #!/usr/local/bin/ae     Neil Brown's ae
#0       string          #!\\ /usr/local/bin/ae   Neil Brown's ae
0       string          #!/bin/nawk             application/x-nawk
0       string          #!\\ /bin/nawk           application/x-nawk
0       string          #!/usr/bin/nawk         application/x-nawk
0       string          #!\\ /usr/bin/nawk       application/x-nawk
0       string          #!/usr/local/bin/nawk   application/x-nawk
0       string          #!\\ /usr/local/bin/nawk application/x-nawk
0       string          #!/bin/gawk             application/x-gawk
0       string          #!\\ /bin/gawk           application/x-gawk
0       string          #!/usr/bin/gawk         application/x-gawk
0       string          #!\\ /usr/bin/gawk       application/x-gawk
0       string          #!/usr/local/bin/gawk   application/x-gawk
0       string          #!\\ /usr/local/bin/gawk application/x-gawk
#
0       string          #!/bin/awk              application/x-awk
0       string          #!\\ /bin/awk            application/x-awk
0       string          #!/usr/bin/awk          application/x-awk
0       string          #!\\ /usr/bin/awk        application/x-awk
# update to distinguish from *.vcf files by Joerg Jenderek: joerg dot jenderek at web dot de
#0	regex		BEGIN[[:space:]]*[{]	application/x-awk

# For Larry Wall's perl language.  The \`\`eval'' line recognizes an
# outrageously clever hack for USG systems.
#                               Keith Waclena <keith@cerberus.uchicago.edu>
0       string          #!/bin/perl                     application/x-perl
0       string          #!\\ /bin/perl                   application/x-perl
0       string          eval\\ "exec\\ /bin/perl          application/x-perl
0       string          #!/usr/bin/perl                 application/x-perl
0       string          #!\\ /usr/bin/perl               application/x-perl
0       string          eval\\ "exec\\ /usr/bin/perl      application/x-perl
0       string          #!/usr/local/bin/perl           application/x-perl
0       string          #!\\ /usr/local/bin/perl         application/x-perl
0       string          eval\\ "exec\\ /usr/local/bin/perl application/x-perl

#------------------------------------------------------------------------------
# compress:  file(1) magic for pure-compression formats (no archives)
#
# compress, gzip, pack, compact, huf, squeeze, crunch, freeze, yabba, whap, etc.
#
# Formats for various forms of compressed data
# Formats for "compress" proper have been moved into "compress.c",
# because it tries to uncompress it to figure out what's inside.

# standard unix compress
#0	string		\\037\\235	application/x-compress

# gzip (GNU zip, not to be confused with [Info-ZIP/PKWARE] zip archiver)
#0       string          \\037\\213        application/x-gzip

0		string			PK\\003\\004		application/x-zip

# RAR archiver (Greg Roelofs, newt@uchicago.edu)
0	string		Rar!		application/x-rar

# According to gzip.h, this is the correct byte order for packed data.
0	string		\\037\\036	application/octet-stream
#
# This magic number is byte-order-independent.
#
0	short		017437		application/octet-stream

# XXX - why *two* entries for "compacted data", one of which is
# byte-order independent, and one of which is byte-order dependent?
#
# compacted data
0	short		0x1fff		application/octet-stream
0	string		\\377\\037	application/octet-stream
# huf output
0	short		0145405		application/octet-stream

# Squeeze and Crunch...
# These numbers were gleaned from the Unix versions of the programs to
# handle these formats.  Note that I can only uncrunch, not crunch, and
# I didn't have a crunched file handy, so the crunch number is untested.
#				Keith Waclena <keith@cerberus.uchicago.edu>
#0	leshort		0x76FF		squeezed data (CP/M, DOS)
#0	leshort		0x76FE		crunched data (CP/M, DOS)

# Freeze
#0	string		\\037\\237	Frozen file 2.1
#0	string		\\037\\236	Frozen file 1.0 (or gzip 0.5)

# lzh?
#0	string		\\037\\240	LZH compressed data

257	string		ustar\\0		application/x-tar	posix
257	string		ustar\\040\\040\\0		application/x-tar	gnu

0	short		070707		application/x-cpio
0	short		0143561		application/x-cpio	swapped

0	string		=<ar>		application/x-archive
0	string		\\!<arch>	application/x-archive
>8	string		debian		application/x-debian-package

#------------------------------------------------------------------------------
#
# RPM: file(1) magic for Red Hat Packages   Erik Troan (ewt@redhat.com)
#
0       beshort         0xedab
>2      beshort         0xeedb          application/x-rpm

0	lelong&0x8080ffff	0x0000081a	application/x-arc	lzw
0	lelong&0x8080ffff	0x0000091a	application/x-arc	squashed
0	lelong&0x8080ffff	0x0000021a	application/x-arc	uncompressed
0	lelong&0x8080ffff	0x0000031a	application/x-arc	packed
0	lelong&0x8080ffff	0x0000041a	application/x-arc	squeezed
0	lelong&0x8080ffff	0x0000061a	application/x-arc	crunched

0	leshort	0xea60	application/x-arj

# LHARC/LHA archiver (Greg Roelofs, newt@uchicago.edu)
2	string	-lh0-	application/x-lharc	lh0
2	string	-lh1-	application/x-lharc	lh1
2	string	-lz4-	application/x-lharc	lz4
2	string	-lz5-	application/x-lharc	lz5
#	[never seen any but the last; -lh4- reported in comp.compression:]
2	string	-lzs-	application/x-lha	lzs
2	string	-lh\\ -	application/x-lha	lh
2	string	-lhd-	application/x-lha	lhd
2	string	-lh2-	application/x-lha	lh2
2	string	-lh3-	application/x-lha	lh3
2	string	-lh4-	application/x-lha	lh4
2	string	-lh5-	application/x-lha	lh5
2	string	-lh6-	application/x-lha	lh6
2	string	-lh7-	application/x-lha	lh7
# Shell archives
10	string	#\\ This\\ is\\ a\\ shell\\ archive	application/octet-stream	x-shell

#------------------------------------------------------------------------------
# frame:  file(1) magic for FrameMaker files
#
# This stuff came on a FrameMaker demo tape, most of which is
# copyright, but this file is "published" as witness the following:
#
0	string		\\<MakerFile	application/x-frame
0	string		\\<MIFFile	application/x-frame
0	string		\\<MakerDictionary	application/x-frame
0	string		\\<MakerScreenFon	application/x-frame
0	string		\\<MML		application/x-frame
0	string		\\<Book		application/x-frame
0	string		\\<Maker		application/x-frame

#------------------------------------------------------------------------------
# html:  file(1) magic for HTML (HyperText Markup Language) docs
#
# from Daniel Quinlan <quinlan@yggdrasil.com>
#
0	string/cB	\\<!DOCTYPE\\ html	text/html
0	string/cb	\\<head	text/html
0	string/cb	\\<title	text/html
0       string/bc	\\<html	text/html
0	string		\\<!--	text/html
0	string/c	\\<h1	text/html

0	string		\\<?xml			text/xml

#------------------------------------------------------------------------------
# images:  file(1) magic for image formats (see also "c-lang" for XPM bitmaps)
#
# originally from jef@helios.ee.lbl.gov (Jef Poskanzer),
# additions by janl@ifi.uio.no as well as others. Jan also suggested
# merging several one- and two-line files into here.
#
# XXX - byte order for GIF and TIFF fields?
# [GRR:  TIFF allows both byte orders; GIF is probably little-endian]
#

# [GRR:  what the hell is this doing in here?]
#0	string		xbtoa		btoa'd file

# PBMPLUS
#					PBM file
0	string		P1		image/x-portable-bitmap	7bit
#					PGM file
0	string		P2		image/x-portable-greymap	7bit
#					PPM file
0	string		P3		image/x-portable-pixmap	7bit
#					PBM "rawbits" file
0	string		P4		image/x-portable-bitmap
#					PGM "rawbits" file
0	string		P5		image/x-portable-greymap
#					PPM "rawbits" file
0	string		P6		image/x-portable-pixmap

# NIFF (Navy Interchange File Format, a modification of TIFF)
# [GRR:  this *must* go before TIFF]
0	string		IIN1		image/x-niff

# TIFF and friends
#					TIFF file, big-endian
0	string		MM		image/tiff
#					TIFF file, little-endian
0	string		II		image/tiff

# possible GIF replacements; none yet released!
# (Greg Roelofs, newt@uchicago.edu)
#
# GRR 950115:  this was mine ("Zip GIF"):
#					ZIF image (GIF+deflate alpha)
0	string		GIF94z		image/unknown
#
# GRR 950115:  this is Jeremy Wohl's Free Graphics Format (better):
#					FGF image (GIF+deflate beta)
0	string		FGF95a		image/unknown
#
# GRR 950115:  this is Thomas Boutell's Portable Bitmap Format proposal
# (best; not yet implemented):
#					PBF image (deflate compression)
0	string		PBF		image/unknown

# GIF
0	string		GIF		image/gif

# JPEG images
0	beshort		0xffd8		image/jpeg

# PC bitmaps (OS/2, Windoze BMP files)  (Greg Roelofs, newt@uchicago.edu)
0	string		BM		image/x-ms-bmp
#>14	byte		12		(OS/2 1.x format)
#>14	byte		64		(OS/2 2.x format)
#>14	byte		40		(Windows 3.x format)
#0	string		IC		icon
#0	string		PI		pointer
#0	string		CI		color icon
#0	string		CP		color pointer
#0	string		BA		bitmap array

# CDROM Filesystems
32769    string    CD001     application/x-iso9660

# Newer StuffIt archives (grant@netbsd.org)
0	string		StuffIt			application/x-stuffit
#>162	string		>0			: %s

# BinHex is the Macintosh ASCII-encoded file format (see also "apple")
# Daniel Quinlan, quinlan@yggdrasil.com
11	string	must\\ be\\ converted\\ with\\ BinHex\\ 4	application/mac-binhex40
##>41	string	x					\\b, version %.3s


#------------------------------------------------------------------------------
# lisp:  file(1) magic for lisp programs
#
# various lisp types, from Daniel Quinlan (quinlan@yggdrasil.com)
0	string	;;			text/plain	8bit
# Emacs 18 - this is always correct, but not very magical.
0	string	\\012(			application/x-elc
# Emacs 19
0	string	;ELC\\023\\000\\000\\000	application/x-elc

#------------------------------------------------------------------------------
# mail.news:  file(1) magic for mail and news
#
# There are tests to ascmagic.c to cope with mail and news.
0	string		Relay-Version: 	message/rfc822	7bit
0	string		#!\\ rnews	message/rfc822	7bit
0	string		N#!\\ rnews	message/rfc822	7bit
0	string		Forward\\ to 	message/rfc822	7bit
0	string		Pipe\\ to 	message/rfc822	7bit
0	string		Return-Path:	message/rfc822	7bit
0	string		Received:	message/rfc822
0	string		Path:		message/news	8bit
0	string		Xref:		message/news	8bit
0	string		From:		message/rfc822	7bit
0	string		Article 	message/news	8bit
#------------------------------------------------------------------------------
# msword: file(1) magic for MS Word files
#
# Contributor claims:
# Reversed-engineered MS Word magic numbers
#

0	string		\\376\\067\\0\\043			application/msword
0	string		\\320\\317\\021\\340\\241\\261	application/msword
0	string		\\333\\245-\\0\\0\\0			application/msword



#------------------------------------------------------------------------------
# printer:  file(1) magic for printer-formatted files
#

# PostScript
0	string		%!		application/postscript
0	string		\\004%!		application/postscript

# Acrobat
# (due to clamen@cs.cmu.edu)
0	string		%PDF-		application/pdf

#------------------------------------------------------------------------------
# sc:  file(1) magic for "sc" spreadsheet
#
38	string		Spreadsheet	application/x-sc

#------------------------------------------------------------------------------
# tex:  file(1) magic for TeX files
#
# XXX - needs byte-endian stuff (big-endian and little-endian DVI?)
#
# From <conklin@talisman.kaleida.com>

# Although we may know the offset of certain text fields in TeX DVI
# and font files, we can't use them reliably because they are not
# zero terminated. [but we do anyway, christos]
0	string		\\367\\002	application/x-dvi
#0	string		\\367\\203	TeX generic font data
#0	string		\\367\\131	TeX packed font data
#0	string		\\367\\312	TeX virtual font data
#0	string		This\\ is\\ TeX,	TeX transcript text	
#0	string		This\\ is\\ METAFONT,	METAFONT transcript text

# There is no way to detect TeX Font Metric (*.tfm) files without
# breaking them apart and reading the data.  The following patterns
# match most *.tfm files generated by METAFONT or afm2tfm.
2	string		\\000\\021	application/x-tex-tfm
2	string		\\000\\022	application/x-tex-tfm
#>34	string		>\\0		(%s)

# Texinfo and GNU Info, from Daniel Quinlan (quinlan@yggdrasil.com)
0	string		\\\\input\\ texinfo		text/x-texinfo
0	string		This\\ is\\ Info\\ file	text/x-info

# correct TeX magic for Linux (and maybe more)
# from Peter Tobias (tobias@server.et-inf.fho-emden.de)
#
0	leshort		0x02f7		application/x-dvi

# RTF - Rich Text Format
0	string		{\\\\rtf		text/rtf

#------------------------------------------------------------------------------
# animation:  file(1) magic for animation/movie formats
#
# animation formats, originally from vax@ccwf.cc.utexas.edu (VaX#n8)
#						MPEG file
# MPEG sequences
0       belong             0x000001BA
>4      byte               &0x40          video/mp2p
>4      byte               ^0x40          video/mpeg
0       belong             0x000001BB     video/mpeg
0       belong             0x000001B0     video/mp4v-es
0       belong             0x000001B5     video/mp4v-es
0       belong             0x000001B3     video/mpv
0       belong&0xFF5FFF1F  0x47400010     video/mp2t
0       belong             0x00000001
>4      byte&0x1F          0x07           video/h264

# FLI animation format
0	leshort		0xAF11				video/fli
# FLC animation format
0	leshort		0xAF12				video/flc
#
# SGI and Apple formats
# Added ISO mimes
0	string		MOVI	      video/sgi
4	string		moov	      video/quicktime
4	string		mdat	      video/quicktime
4	string		wide	      video/quicktime
4	string		skip	      video/quicktime
4	string		free	      video/quicktime
4	string		idsc	      image/x-quicktime
4	string		idat	      image/x-quicktime
4	string		pckg	      application/x-quicktime
4	string/B	jP	      image/jp2
4	string		ftyp
>8	string		isom	      video/mp4
>8	string		mp41	      video/mp4
>8	string		mp42	      video/mp4
>8	string/B	jp2	      image/jp2
>8	string		3gp	      video/3gpp
>8      string          avc1          video/3gpp
>8	string		mmp4	      video/mp4
>8	string/B	M4A	      audio/mp4
>8	string/B	qt	      video/quicktime
# The contributor claims:
#   I couldn't find a real magic number for these, however, this
#   -appears- to work.  Note that it might catch other files, too,
#   so BE CAREFUL!
#
# Note that title and author appear in the two 20-byte chunks
# at decimal offsets 2 and 22, respectively, but they are XOR'ed with
# 255 (hex FF)! DL format SUCKS BIG ROCKS.
#
#						DL file version 1 , medium format (160x100, 4 images/screen)
0	byte		1			video/unknown
0	byte		2			video/unknown
#
# Databases
#
# GDBM magic numbers
#  Will be maintained as part of the GDBM distribution in the future.
#  <downsj@teeny.org>
0       belong  0x13579ace      application/x-gdbm
0       lelong  0x13579ace      application/x-gdbm
0       string  GDBM            application/x-gdbm
#
0       belong  0x061561        application/x-dbm
#
# Executables
#
0	string		\\177ELF 
>16	leshort		0		application/octet-stream
>16	leshort		1		application/x-object
>16	leshort		2		application/x-executable
>16	leshort		3		application/x-sharedlib
>16	leshort		4		application/x-coredump
>16	beshort		0		application/octet-stream
>16	beshort		1		application/x-object
>16	beshort		2		application/x-executable
>16	beshort		3		application/x-sharedlib
>16	beshort		4		application/x-coredump
#
# DOS
0		string			MZ				application/x-dosexec
#
# KDE
0		string	[KDE\\ Desktop\\ Entry]	application/x-kdelnk
0		string	\\#\\ KDE\\ Config\\ File	application/x-kdelnk
# xmcd database file for kscd
0		string	\\#\\ xmcd                text/xmcd

#------------------------------------------------------------------------------
# pkgadd:  file(1) magic for SysV R4 PKG Datastreams
#
0       string          #\\ PaCkAgE\\ DaTaStReAm  application/x-svr4-package

#PNG Image Format
0	string		\\x89PNG			image/png

# MNG Video Format, <URL:http://www.libpng.org/pub/mng/spec/>
0	string		\\x8aMNG			video/x-mng
0	string		\\x8aJNG			video/x-jng

#------------------------------------------------------------------------------
# Hierarchical Data Format, used to facilitate scientific data exchange
# specifications at http://hdf.ncsa.uiuc.edu/
#Hierarchical Data Format (version 4) data
0	belong		0x0e031301		application/x-hdf
#Hierarchical Data Format (version 5) data
0	string		\\211HDF\\r\\n\\032		application/x-hdf

# Adobe Photoshop
0	string		8BPS			image/x-photoshop

# Felix von Leitner <felix-file@fefe.de>
0	string		d8:announce		application/x-bittorrent


# lotus 1-2-3 document
0	belong	0x00001a00	application/x-123
0	belong	0x00000200 	application/x-123

# MS Access database
4	string	Standard\\ Jet\\ DB	application/msaccess

## magic for XBase files
#0      byte       0x02	
#>8     leshort	  >0
#>>12   leshort    0	application/x-dbf
#
#0      byte       0x03	
#>8     leshort	  >0
#>>12   leshort    0	application/x-dbf
#
#0      byte       0x04	
#>8     leshort	  >0
#>>12   leshort    0	application/x-dbf
#
#0      byte       0x05	
#>8     leshort	  >0
#>>12   leshort    0	application/x-dbf
#
#0      byte       0x30
#>8     leshort	  >0
#>>12   leshort    0	application/x-dbf
#
#0      byte       0x43
#>8     leshort	  >0
#>>12   leshort    0	application/x-dbf
#
#0      byte       0x7b
#>8     leshort	  >0
#>>12   leshort    0	application/x-dbf
#
#0      byte       0x83	
#>8     leshort	  >0
#>>12   leshort    0	application/x-dbf
#
#0      byte       0x8b
#>8     leshort	  >0
#>>12   leshort    0	application/x-dbf
#
#0      byte       0x8e	
#>8     leshort	  >0
#>>12   leshort    0	application/x-dbf
#
#0      byte       0xb3
#>8     leshort	  >0
#>>12   leshort    0	application/x-dbf
#
#0      byte       0xf5
#>8     leshort	  >0
#>>12   leshort    0	application/x-dbf
#
#0	leshort		0x0006		application/x-dbt

# Debian has entries for the old PGP formats:
# pgp:  file(1) magic for Pretty Good Privacy
# see http://lists.gnupg.org/pipermail/gnupg-devel/1999-September/016052.html
#text/PGP key public ring
0	beshort		0x9900			application/pgp
#text/PGP key security ring
0	beshort		0x9501			application/pgp
#text/PGP key security ring
0	beshort		0x9500			application/pgp
#text/PGP encrypted data
0	beshort		0xa600			application/pgp-encrypted
#text/PGP armored data
##public key block
2	string	---BEGIN\\ PGP\\ PUBLIC\\ KEY\\ BLOCK-	application/pgp-keys
0	string	-----BEGIN\\040PGP\\40MESSAGE-			application/pgp
0	string	-----BEGIN\\040PGP\\40SIGNATURE-			application/pgp-signature
#
# GnuPG Magic:
# 
#
#text/GnuPG key public ring
0	beshort		0x9901			application/pgp
#text/OpenPGP data
0	beshort		0x8501			application/pgp-encrypted	

# flash:        file(1) magic for Macromedia Flash file format
#
# See
#
#       http://www.macromedia.com/software/flash/open/
#
0	string		FWS             
>3	byte		x			application/x-shockwave-flash

# The following paramaters are created for Namazu.
# <http://www.namazu.org/>
#
# 1999/08/13
#0	string		\\<!--\\ MHonArc		text/html; x-type=mhonarc
0	string		BZh			application/x-bzip2

# 1999/09/09
# VRML (suggested by Masao Takaku)
0	string		#VRML\\ V1.0\\ ascii	model/vrml
0	string		#VRML\\ V2.0\\ utf8	model/vrml

#------------------------------------------------------------------------------
# ichitaro456: file(1) magic for Just System Word Processor Ichitaro
#
# Contributor kenzo-:
# Reversed-engineered JS Ichitaro magic numbers
#

0	string		DOC
>43	byte		0x14		application/ichitaro4
>144	string	JDASH		application/ichitaro4

0	string		DOC
>43	byte		0x15		application/ichitaro5

0	string		DOC
>43	byte		0x16		application/ichitaro6

#------------------------------------------------------------------------------
# office97: file(1) magic for MicroSoft Office files
#
# Contributor kenzo-:
# Reversed-engineered MS Office magic numbers
#

#0       string          \\320\\317\\021\\340\\241\\261\\032\\341
#>48     byte            0x1B            application/excel

2080	string	Microsoft\\ Excel\\ 5.0\\ Worksheet	application/excel
2114	string	Biff5					application/excel

0       string	\\224\\246\\056		application/msword

0	belong	0x31be0000		application/msword

0	string	PO^Q\`			application/msword

0	string	\\320\\317\\021\\340\\241\\261\\032\\341
>546	string	bjbj			application/msword
>546	string	jbjb			application/msword

512	string	R\\0o\\0o\\0t\\0\\ \\0E\\0n\\0t\\0r\\0y	application/msword

2080	string	Microsoft\ Word\ 6.0\ Document	application/msword
2080	string	Documento\ Microsoft\ Word\ 6	application/msword
2112	string	MSWordDoc			application/msword

#0	string	\\320\\317\\021\\340\\241\\261\\032\\341	application/powerpoint
0	string	\\320\\317\\021\\340\\241\\261\\032\\341	application/msword

0       string  #\\ PaCkAgE\\ DaTaStReAm  application/x-svr4-package


# WinNT/WinCE PE files (Warner Losh, imp@village.org)
#
128		string	PE\\000\\000	application/octet-stream
0		string	PE\\000\\000	application/octet-stream

# miscellaneous formats
0		string	LZ		application/octet-stream


# .EXE formats (Greg Roelofs, newt@uchicago.edu)
#
0		string	MZ
>24		string	@		application/octet-stream

0		string	MZ
>30		string	Copyright\\ 1989-1990\\ PKWARE\\ Inc.	application/x-zip

0		string	MZ
>30		string	PKLITE\\ Copr.	application/x-zip

0		string	MZ
>36		string	LHa's\\ SFX	application/x-lha

0		string	MZ		application/octet-stream

# LHA archiver
2		string	-lh
>6		string	-		application/x-lha


# Zoo archiver
20		lelong	0xfdc4a7dc	application/x-zoo

# ARC archiver
0       	lelong&0x8080ffff	0x0000081a	application/x-arc
0		lelong&0x8080ffff	0x0000091a	application/x-arc
0		lelong&0x8080ffff	0x0000021a	application/x-arc
0		lelong&0x8080ffff	0x0000031a	application/x-arc
0		lelong&0x8080ffff	0x0000041a	application/x-arc
0		lelong&0x8080ffff	0x0000061a	application/x-arc

# Microsoft Outlook's Transport Neutral Encapsulation Format (TNEF)
0		lelong	0x223e9f78	application/ms-tnef

# From: stephane.loeuillet@tiscali.f
# http://www.djvuzone.org/
0	string		AT&TFORM	image/x.djvu

# Danny Milosavljevic <danny.milo@gmx.net>
# this are adrift (adventure game standard) game files, extension .taf
# depending on version magic continues with 0x93453E6139FA (V 4.0)
# 0x9445376139FA (V 3.90)
# 0x9445366139FA (V 3.80)
# this is from source (http://www.adrift.org.uk/) and I have some taf
# files, and checked them.
#0	belong	0x3C423FC9
#>4	belong	0x6A87C2CF	application/x-adrift
#0	string	\\000\\000\\001\\000	image/x-ico

# Quark Xpress 3 Files:
# (made the mimetype up) 
0	string	\\0\\0MMXPR3\\0	application/x-quark-xpress-3

# EET archive
# From: Tilman Sauerbeck <tilman@code-monkey.de>
0	belong	0x1ee7ff00	application/x-eet

# From: Denis Knauf, via gentoo.
0	string	fLaC		audio/x-flac
0	string	CWS		application/x-shockwave-flash

# Gnumeric spreadsheet
# This entry is only semi-helpful, as Gnumeric compresses its files, so
# they will ordinarily reported as "compressed", but at least -z helps
39      string          =<gmr:Workbook           application/x-gnumeric`;
    const apache2ports = `# If you just change the port or add more ports here, you will likely also
# have to change the VirtualHost statement in
# /etc/apache2/sites-enabled/000-default.conf

Listen 80

<IfModule ssl_module>
    Listen 443
</IfModule>

<IfModule mod_gnutls.c>
    Listen 443
</IfModule>`;
    const pmasymlink = `This is a symlink to phpMyAdmin, you may delete it or keep it for easy access to phpMyAdmin.`;
    fs.writeFileSync(literalpath + '/docker/builds/httpd/Dockerfile', apache2dockerfile);
    fs.writeFileSync(literalpath + '/docker/builds/httpd/httpd.conf', httpdconf);
    fs.writeFileSync(literalpath + '/docker/builds/httpd/apache2/conf-available/charset.conf', apache2charset);
    fs.writeFileSync(literalpath + '/docker/builds/httpd/apache2/conf-available/localized-error-pages.conf', apache2localizederrorpages);
    fs.writeFileSync(literalpath + '/docker/builds/httpd/apache2/conf-available/other-vhosts-access-log.conf', apache2othervhostsaccesslog);
    fs.writeFileSync(literalpath + '/docker/builds/httpd/apache2/conf-available/security.conf', apache2security);
    fs.writeFileSync(literalpath + '/docker/builds/httpd/apache2/conf-available/serve-cgi-bin.conf', apache2servecgibin);
    fs.writeFileSync(literalpath + '/docker/builds/httpd/apache2/apache2.conf', apache2conf);
    fs.writeFileSync(literalpath + '/docker/builds/httpd/apache2/envvars', apache2envvars);
    fs.writeFileSync(literalpath + '/docker/builds/httpd/apache2/magic', apache2magic);
    fs.writeFileSync(literalpath + '/docker/builds/httpd/apache2/ports.conf', apache2ports);
    fs.writeFileSync(literalpath + '/docker/data/httpd/mariadb', pmasymlink);
};
function createmariadb() {
    const mariadbdockerfile = `FROM mariadb:latest
WORKDIR /
RUN apt-get update && apt-get upgrade -y --fix-missing --install-recommends
COPY ./my.cnf /etc/mysql/conf.d/my.cnf
RUN mkdir -p /var/lib/mysql/
COPY ./novampp.sh /docker-entrypoint-initdb.d/novampp.sh
COPY ./novampp.sql /docker-entrypoint-initdb.d/novampp.sql
RUN apt-get clean`;
    const mariadbmycnf = `[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
port = 3306
bind-address = 0.0.0.0
datadir = /var/lib/mysql
log_bin = /var/lib/mysql/mysql-bin
max_connections = 100
key_buffer_size = 256M
lower_case_table_names=2
innodb_buffer_pool_size = 512M
innodb_flush_log_at_trx_commit = 1
innodb_file_per_table = 1
innodb_flush_method = O_DIRECT
innodb_lock_wait_timeout = 50
innodb_read_io_threads = 4
innodb_write_io_threads = 4
innodb_io_capacity = 200
innodb_autoinc_lock_mode = 2
innodb_stats_on_metadata = 0
innodb_strict_mode = 1
sql_mode = NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO
binlog_expire_logs_seconds = 604800
max_binlog_size = 100M
read_only = 1
skip_name_resolve = 1
max_allowed_packet = 64M
wait_timeout = 28800
interactive_timeout = 28800`;
    const mariadbnovamppsh = `if [ -z "$(ls -A /var/lib/mysql)" ]; then
mysqld_secure_installation
mysql_install_db --user=mysql --datadir=/var/lib/mysql
/usr/bin/mysqld_safe
fi`;
    const mariadbnovamppsql = `GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.20.0.1';
FLUSH PRIVILEGES;`;
    fs.writeFileSync(literalpath + '/docker/builds/mariadb/Dockerfile', mariadbdockerfile);
    fs.writeFileSync(literalpath + '/docker/builds/mariadb/my.cnf', mariadbmycnf);
    fs.writeFileSync(literalpath + '/docker/builds/mariadb/novampp.sh', mariadbnovamppsh);
    fs.writeFileSync(literalpath + '/docker/builds/mariadb/novampp.sql', mariadbnovamppsql);
};
function createpma () {
    const pmadockerfile = `FROM phpmyadmin:apache
ARG IMAGE_NAME=novampp-phpmyadmin
WORKDIR /
RUN apt-get update && apt-get upgrade -y --fix-missing --install-recommends
COP ./phpmyadmin.inc.php /etc/phpmyadmin/config.inc.php`;
    const pmaincphp = `<?php
/**
 * Generated configuration file
 * Generated by: phpMyAdmin 5.2.1 setup script
 * Date: Sat, 06 Apr 2024 11:33:00 +0000
 */

/* Servers configuration */
$i = 0;

/* Server: 127.0.0.1 [1] */
$i++;
$cfg['Servers'][$i]['verbose'] = '';
$cfg['Servers'][$i]['host'] = 'novampp-mariadb';
$cfg['Servers'][$i]['port'] = 3306;
$cfg['Servers'][$i]['socket'] = '';
$cfg['Servers'][$i]['auth_type'] = 'cookie';
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = 'root';
$cfg['Servers'][$i]['AllowNoPassword'] = true;
$cfg['Servers'][$i]['extension'] = 'mysqli';
$cfg['Servers'][$i]['AllowRoot'] = true;
$cfg['Servers'][$i]['AllowDeny']['order'] = '';
$cfg['Servers'][$i]['AllowDeny']['rules'] = array();
$cfg['Servers'][$i]['ssl'] = false;
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['controluser'] = '';
$cfg['Servers'][$i]['controlpass'] = '';
$cfg['Servers'][$i]['pmadb'] = '';
$cfg['Servers'][$i]['bookmarktable'] = '';
$cfg['Servers'][$i]['relation'] = '';
$cfg['Servers'][$i]['table_info'] = '';
$cfg['Servers'][$i]['table_coords'] = '';
$cfg['Servers'][$i]['pdf_pages'] = '';
$cfg['Servers'][$i]['column_info'] = '';
$cfg['Servers'][$i]['history'] = '';
$cfg['Servers'][$i]['designer_coords'] = '';
$cfg['Servers'][$i]['tracking'] = '';
$cfg['Servers'][$i]['userconfig'] = '';
$cfg['Servers'][$i]['recent'] = '';
$cfg['Servers'][$i]['favorite'] = '';
$cfg['Servers'][$i]['users'] = '';
$cfg['Servers'][$i]['usergroups'] = '';
$cfg['Servers'][$i]['navigationhiding'] = '';
$cfg['Servers'][$i]['savedsearches'] = '';
$cfg['Servers'][$i]['central_columns'] = '';
$cfg['Servers'][$i]['designer_settings'] = '';
$cfg['Servers'][$i]['export_templates'] = '';
$cfg['Servers'][$i]['import_templates'] = '';
$cfg['Servers'][$i]['execute'] = '';

/* End of servers configuration */

$cfg['blowfish_secret'] = \\sodium_hex2bin('8168124dd4a631dae4c369282aa6312e46d155c0926806134173fe9de1b6b9bc');
$cfg['DefaultLang'] = 'en';
$cfg['ServerDefault'] = 1;
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';`;
    fs.writeFileSync(literalpath + '/docker/builds/phpmyadmin/Dockerfile', pmadockerfile);
    fs.writeFileSync(literalpath + '/docker/builds/phpmyadmin/phpmyadmin.inc.php', pmaincphp);
};
module.exports = {
    composemaker
};