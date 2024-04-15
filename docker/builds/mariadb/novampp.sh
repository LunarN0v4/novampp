if [ -z "$(ls -A /var/lib/mysql)" ]; then
    mysqld_secure_installation
    mysql_install_db --user=mysql --datadir=/var/lib/mysql
    /usr/bin/mysqld_safe
fi