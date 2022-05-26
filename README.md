<p align="center">
  <img src="./public/eye.PNG">
</p>  
<p align="center">
  <a href="https://baboo.shop/">view demo</a>
</p>

# The Eye of Horus

### A Monitoring and Alerting Application

- Collect system metrics periodically by utilizing collectd.
- Store time-series data by Influxdb.
- Visualize data in bar/line chart and construct dashboard with Plotly.
- Send alert while comparing metric values to a user-defined threshold by Linux crontab to execute workers periodically.
- Allow users to define alert rules and send customized alert messages via email, discord, and slack.

<br>

## **Table of Contents**

- [Architecture](#Architecture)
- [Tech Stack](#Tech-Stack)
- [Database Schema](#Database-Schema)
- [Demo](#Demo)
- [Getting Started](#Getting-Started)
  - [Deploy by Git Clone](#Deploy-by-Git-Clone)
  - [Deploy by Docker Compose](#Deploy-by-Docker-Compose)
- [Contact](#Contact)

<br>

## **Architecture**

<p align="center">
  <img src="./public/Architecture.png">
</p>

<br>
 
## **Tech Stack**

- ### **Back-End**

  - Node.js
  - Express.js

- ### **Front-End**

  - HTML
  - CSS
  - JavaScript + AJAX + jQuery

- ### **Database**

  - MySQL
  - Redis
  - InfluxDB (TSDB)

- ### **AWS Cloud Services**

  - Elastic Compute Cloud (EC2)

- ### **Networking**
  - HTTP & HTTPS
  - NGINX
  - SSL Certificate
  - Domain Name System (DNS)

<br>

## **Database Schema**

<p align="center">
  <img src="./public/DBschema.png">
</p>

<br>

## **Demo**

### Login page & Dashboard detail

![Login page & Dashboard detail](/gif/login_dashboard.gif)

### Add dashboard

![Add dashboard](/gif/add_dashboard.gif)

### Create chart

![Create chart](/gif/create_chart.gif)

### Add receiver

![Add receiver](/gif/add_receiver.gif)

### Add alert

![Add alert](/gif/add_alert.gif)

<br>

# Getting Started

## **Deploy by Git Clone**

### **Prerequisites**

Listed below are the softwares you need to install.

- [MySQL v8](https://dev.mysql.com/downloads/installer/)
- [Redis v6.2](https://redis.io/docs/getting-started/)
- [Influxdb v1.8.10](https://portal.influxdata.com/downloads/)

### **Installing**

1. Clone the repo

```
  https://github.com/CHLin13/The-Eye-of-Horus.git
```

2. Go to the target folder

```
  cd The-Eye-of-Horus
```

3. Install NPM packages

```
  npm install
```

4. Edit .env file

5. Run the project

```
  npm run start
```

6. Run the alert-worker

```
  npm run worker
```

7. (Optional) Use [npm package](https://www.npmjs.com/package/@chlin13/the-eye-of-horus) to collect application performance data

```
npm i @chlin13/the-eye-of-horus
```

<br>  
<br>

## **Deploy by Docker Compose**

### **Prerequisites**

- [Install Docker Compose](https://docs.docker.com/compose/install/)
- [Install Nginx](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/)
- [Install crontab](https://tecadmin.net/install-crontab-in-linux/)

* collectd setting

1. Install collectd

```
yum install collectd
```

2. Open collectd.conf with default editor

```
vi /etc/collectd.conf
```

3. Edit collectd.conf

```
LoadPlugin network
<Plugin "network">
    Server "localhost" "25826"

    # If you want to collect the data from other server add the line down below.
    # Listen "___target_server_ip___" "___target_server_collectd_port___"
</Plugin>

```

You can also select the service you want to monitor.  
Just remove the comment mark (#) at the beginning of a line.

### **Installing**

Here is the `.env` example.

```
PORT = 3000
NODE_ENV = development

MYSQL_PORT = 3306
MYSQL_URL = the-eye-of-horus-mysql-1
MYSQL_USER = root
MYSQL_PASSWORD =

REDIS_USER = default
REDIS_PASSWORD =
REDIS_URL = the-eye-of-horus-redis-1
REDIS_PORT = 6379

SESSION_SECRET =

INFLUX_URL = http://the-eye-of-horus-influx-1
INFLUX_PORT = 8086
INFLUX_SERVER_PORT = 25826
INFLUX_CLIENT_PORT =

NGINX_80PORT = 80
NGINX_443PORT = 443
```

Here is the `docker-compose.yml` that powers the whole setup.

```
version: '1.0'

services:
   mysql:
     image: mysql:8
     ports:
       - "${MYSQL_PORT}:3306"
     volumes:
       - "mysqlV:/var/lib/mysql"
       - "sqlV:/docker-entrypoint-initdb.d"
     restart: always
     environment:
       MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWORD}

   redis:
     image: redis:6.2-alpine
     command: --requirepass ${REDIS_PASSWORD}
     volumes:
       - "redisV:/var/lib/redis"
     ports:
       - "${REDIS_PORT}:6379"
     restart: always

   influx:
     image: influxdb:1.8.10-alpine
     ports:
       - "${INFLUX_PORT}:8086"
       - "${INFLUX_SERVER_PORT}:25826/udp"
       - "${INFLUX_CLIENT_PORT}: __other_influx_client_port_here__/udp"
     volumes:
       - "influxV:/var/lib/influxdb"
       - "etcInfluxV:/etc/influxdb"
       - "/usr/share/collectd:/usr/share/collectd"

     restart: always

   eye:
     depends_on:
       - mysql
       - redis
       - influx
     image: chlin13/eye:latest
     ports:
       - "${PORT}:3000"
     volumes:
       - "sqlV:/usr/src/app/sql"
     restart: always
     env_file:
       - __your_.env_file_path_here__

   nginx:
     depends_on:
       - eye
     image: nginx
     ports:
       - "${NGINX_80PORT}:80"
       - "${NGINX_443PORT}:443"
     volumes:
       - "__your_nginx_folder_path_here__:/etc/nginx"
     restart: always

volumes:
  mysqlV:
    external: false
  redisV:
    external: false
  etcRedisV:
    external: false
  influxV:
    external: false
  etcInfluxV:
    external: false
  sqlV:
    external: false
  nginxV:
    external: false

networks:
  default:
    driver: bridge
    external: false
    name: eye-net
```

### **All in one**

1. Update your .env file, influxdb port and nginx folder path in docker-compose.yml
2. Run all containers with docker-compose up
3. Run a new command in influx container

```
docker exec -it the-eye-of-horus-influx-1 /bin/bash
```

4. Open influxdb.conf with default editor

```
vi /etc/influxdb/influxdb.conf
```

5. Add lines to influxdb.conf

```
# Local server
[[collectd]]
  enabled = true
  bind-address = ":25826"
  database = "collectd"
  retention-policy = ""
  batch-size = 5000
  batch-pending = 10
  batch-timeout = "10s"
  read-buffer = 0
  typesdb = "/usr/share/collectd/types.db"
  security-level = "none"
  parse-multivalue-plugin = "split"

# Client server
#[[collectd]]
#  enabled = true
#  bind-address = "__other_influx_client_port_here__"
#  database = "Client"
#  retention-policy = ""
#  batch-size = 5000
#  batch-pending = 10
#  batch-timeout = "10s"
#  read-buffer = 0
#  typesdb = "/usr/share/collectd/types.db"
#  security-level = "none"
#  parse-multivalue-plugin = "split"
```

6. Docker pull worker

```
docker pull chlin13/eye-worker
```

7. worker .env.example  
   Interval only accept specific value (eg. 1m, 5m, 10m, 30m, 1h, 3h, 6h, 12h, 18h, 1d, 3d, 1w, 1M, 3M, 6M, 1y, 2y).

```
MYSQL_URL =
MYSQL_USER =
MYSQL_PASSWORD =

REDIS_USER =
REDIS_PASSWORD =
REDIS_URL =
REDIS_PORT =

INFLUX_URL =
INFLUX_PORT =

MGAPIKEY =

INTERVAL =
```

8. Add New Job in Crontab

```
crontab -e
```

9. Crontab setting example

```
* * * * * docker run --name ___worker_name___ --env-file ___worker_.env_file_path___ --rm eye-worker >> ___log_file_path___ 2>&1
```

10. (Optional) Use [npm package](https://www.npmjs.com/package/@chlin13/the-eye-of-horus) to collect application performance data

```
npm i @chlin13/the-eye-of-horus
```

## **Contact**

- **Author:** <a href="https://github.com/CHLin13" target="_blank">CH Lin</a>
- **Email:** lch132502@gmail.com
