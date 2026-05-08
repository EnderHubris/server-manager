#!/bin/bash

NEW_ROOT_PASSWORD=$(openssl rand -base64 32)

# change root password
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF

-- randomize root password
ALTER USER 'root'@'%' IDENTIFIED BY '${NEW_ROOT_PASSWORD}';
ALTER USER 'root'@'localhost' IDENTIFIED BY '${NEW_ROOT_PASSWORD}';

-- disable file access globally
SET GLOBAL local_infile = 0;

-- revoke dangerous privileges from all users
REVOKE FILE ON *.* FROM 'root'@'%';
REVOKE FILE ON *.* FROM 'root'@'localhost';
REVOKE SUPER ON *.* FROM 'root'@'%';
REVOKE PROCESS ON *.* FROM 'root'@'%';
REVOKE SHUTDOWN ON *.* FROM 'root'@'%';
REVOKE CREATE USER ON *.* FROM 'root'@'%';
REVOKE SYSTEM_VARIABLES_ADMIN ON *.* FROM 'root'@'%';

FLUSH PRIVILEGES;
EOF

# save new root password
echo "$NEW_ROOT_PASSWORD" > /var/lib/mysql/root_password.txt
chmod 600 /var/lib/mysql/root_password.txt

# create schema
mysql -u root -p"$NEW_ROOT_PASSWORD" "$MYSQL_DATABASE" < /docker-entrypoint-initdb.d/init.sql

# create low priv user with only what the app needs
mysql -u root -p"$NEW_ROOT_PASSWORD" <<EOF

CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_USER_PASSWORD}';

-- only grant what the app actually needs
GRANT SELECT, INSERT, UPDATE, DELETE ON ${DB_DATABASE}.* TO '${DB_USER}'@'%';

-- explicitly deny dangerous privileges
REVOKE FILE         ON *.* FROM '${DB_USER}'@'%';
REVOKE SUPER        ON *.* FROM '${DB_USER}'@'%';
REVOKE PROCESS      ON *.* FROM '${DB_USER}'@'%';
REVOKE SHUTDOWN     ON *.* FROM '${DB_USER}'@'%';
REVOKE CREATE USER  ON *.* FROM '${DB_USER}'@'%';
REVOKE RELOAD       ON *.* FROM '${DB_USER}'@'%';

FLUSH PRIVILEGES;
EOF

# lock down mysql config to prevent LOAD DATA / INTO OUTFILE
mysql -u root -p"$NEW_ROOT_PASSWORD" <<EOF
SET GLOBAL secure_file_priv = NULL;
SET GLOBAL local_infile = 0;
EOF

echo "[+] MySQL hardened and low priv user created"
echo "[+] Root password randomized and saved to /var/lib/mysql/root_password.txt"