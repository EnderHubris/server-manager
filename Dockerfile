ARG DOCKER_GID

FROM nginx:latest
WORKDIR /
RUN apt-get update && apt-get install -y supervisor sudo nodejs npm net-tools

# initial file system preperation
RUN mkdir -p /var/www/server_manager/tmp_archives
RUN mkdir -p /var/www/server_manager/uploads
RUN mkdir -p /var/www/server_manager/backups

RUN mkdir -p /app/local_storage
RUN mkdir -p /var/www/project

# give www-data docker group membership
RUN groupadd -g ${DOCKER_GID} docker && usermod -aG docker www-data

RUN chsh -s /bin/bash www-data

# move svelte folders into project area
COPY src/ /var/www/project/src
COPY static/ /var/www/project/static
COPY package.json package-lock.json /var/www/project/
COPY svelte.config.js tsconfig.json vite.config.ts build_svelte.sh /var/www/project/

# prep build handler and build NGINX production files
RUN chown -R www-data:www-data /var/www

# allow www-data and group to handle server files
RUN chown -R www-data:www-data /app/

# allow www-data group members to manipulate web-files
RUN chmod -R 775 /var/www
RUN chmod +x /var/www/project/build_svelte.sh
RUN su www-data -c 'bash /var/www/project/build_svelte.sh'

# configure NGINX
RUN rm /etc/nginx/conf.d/default.conf
COPY server_manager.conf /etc/nginx/conf.d/server_manager.conf

EXPOSE 80

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# prep entry script and execute it
COPY entrypoint.sh /root/entrypoint.sh
RUN chmod +x /root/entrypoint.sh

CMD ["/root/entrypoint.sh"]