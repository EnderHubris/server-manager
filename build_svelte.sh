#!/bin/bash

mkdir -p /var/www/project/build/

ready_build() {
    # move production files
    cp -r /var/www/project/build/* /var/www/server_manager

    # make links to dependencies
    ln -s /var/www/project/node_modules /var/www/server_manager/node_modules
    ln -s /var/www/project/package-lock.json /var/www/server_manager/package-lock.json
    ln -s /var/www/project/package.json /var/www/server_manager/package.json
}

# move into project ctx
cd /var/www/project/

# install dependencies
npm install .

# build production files
npm run build && ready_build