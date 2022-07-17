# How to Install StoreDown

We are still in the early days. 
I hope to reduce the skills required to use StoreDown.

> Remember you need to Deploy StoredDown and configure an Apache CouchDB instance. 
> StoreDown uses a CouchDB database to sync.
> Instructions on how to setup CouchDB are at the bottom of this file.  
> TLDR: Pick an option __AND__ configure CouchDB

## Option 1:
You can download a [zip of the most recent release](https://github.com/FoxUSA/StoreDown/releases) and extract it in your webserver of choice(S3, Apache, NGINX, etc ....)

## Option 2: Using `docker`
`docker run -d -p 8080:80 foxusa/storedown`

## Option 3: Using `docker-compose`
> If you want to use SSL/TLS skip this and go down to that section
> 
Put the following text in a `docker-compose.yml`. 
Make sure to set all the items marked `#TODO`.  
Also make sure this file is in a secure place.  
Your credentials are stored in it.  
```
version: "2"
services:
  storedown:
    image: foxusa/storedown
    restart: always
    ports:
      - "80:80"
  couchdb:
    image: couchdb
    restart: always
    volumes:
      - "<HOST_LOCATION>:/opt/couchdb/data" #TODO set this to prevent accidentally deleting your database data
    ports:
      - "5984:5984"
    environment:
      COUCHDB_USER: user #TODO set this
      COUCHDB_PASSWORD: password #TODO set this
```

You can then run `docker-compose up -d` to start the services.

### SSL/TLS
Create a folder with a SSL `private.key` and `public.crt` this gets mounted by nginx to encrypt connections.  
The `public.crt` file should have your servers cert and the whole cert chain appended to it.

Create a nginx config file that proxies CouchDB traffic via SSL.  
[Here is an example you can use as is.](https://github.com/FoxUSA/OpenNote-Docker/blob/master/samples/nginx/default.conf) 

Mount these files using the following `docker-compose.yml`
```
version: "2"
services:
  storedown:
    image: foxusa/storedown
    restart: always
    volumes:
      -  $HOST_LOCATION/certs:/root/certs:ro  #TODO set this
      -  $HOST_LOCATION/storedown.default.conf:/etc/nginx/conf.d/default.conf:ro #TODO file created above
    ports:
      -  80:80
      -  443:443
      -  6984:6984 #CouchDB Proxy
    links:
      - couchdb:couchdb

  couchdb:
    restart: always
    image: couchdb
    volumes:
      -   /opt/StoreDown/couchdb:/opt/couchdb/data
    ports:
      -   5984:5984
    environment:
      COUCHDB_USER: $user #TODO set this
      COUCHDB_PASSWORD: $password #TODO set this

```

You can then run `docker-compose up -d` to start the services.

--- 

### CouchDB config
- [ ] Go to `http://$serverurl:5984/_utils/#_config/nonode@nohost/cors` and enable CORS for your domain.
- [ ] Go to Go to `http://$serverurl:5984/_utils/#_config/nonode@nohost` and set in the `httpd` section, `WWW-Authenticate` to `Basic realm="administrator"`
- [ ] Go to `http://$serverurl:5984/_utils/#_config/nonode@nohost` and set in the `chttpd` section `require_valid_user` to `true`. 
  >If you are unable to get to the login screen after setting that, you can access it via `http://$serverurl:5984/_utils/#login`
- [ ] Then open StoreDown and log in with the username, password, url, port, and database you configured.
