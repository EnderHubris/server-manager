#!/bin/bash

# Executed by supervisord service as www-data

cd /var/www/server_manager

# generate default serv.conf
cat <<EOF > /var/www/server_manager/serv.conf
{"server_root":"/app/local_storage"}
EOF

# svelte post build you must load .env contents into process env
export DB_HOST=db
export DB_PORT=3306
export DB_USER=$DB_USER
export DB_PASSWORD=$DB_PASSWORD
export DB_DATABASE=management
export CONF_FILE=/var/www/server_manager/serv.conf
export HOST_VOL=$HOST_VOL

# start the node server
node /var/www/server_manager