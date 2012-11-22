redis-futon
===========

__Redis Web Interface__

A Web Interface for Redis - The goal for this app provides a couchdb-futon like web interface.
Currenty, this is pretty much an alpha version, but it could become useable over time. :-)


## Prerequisites

#### Redis Server and commands 

    brew install redis

#### NodeJS and npm


## Installation
    
    // install
    $ npm install redis-futon -g

    // upgrade
    $ npm update redis-futon -g

    // uninstall 
    $ npm uninstall redis-futon -g


## Start & Use

    $ redis-futon [5985]
    $ open http://localhost:5985



## Dev Tools

* Redis
* AngularJS
* NodeJS
* CoffeeScript


## How to start 

#### when redis is running already

    ./bin/redis-futon 5985

or

    node index.js 5985

#### with redis-server (when there is no running redis) 

    foreman start




