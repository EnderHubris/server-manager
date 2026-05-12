#!/bin/bash
set -e

# give www-data docker group membership
groupadd -g $DOCKER_GID docker && usermod -aG docker www-data

# Start supervisord in the background
/usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf &

# Wait until supervisor socket exists
echo "Waiting for supervisord socket..."
while [ ! -S /var/run/supervisor.sock ]; do
    sleep 0.1
done

# reload config
nginx -s reload

# Keep container alive
wait