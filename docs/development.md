# Development


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Run your unit tests
```
npm run test:unit
```

### Zip up the build folder
```
npm run dist
```


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Build the Docker container
```
docker build -t foxusa/storedown:$tag .
# On M1 Macs
docker build --platform linux/amd64 -t foxusa/storedown:latest -t foxusa/storedown:$version .
```

### Push container
```
docker push --all-tags foxusa/storedown
```