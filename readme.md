# Monstercat

This project contains the server and client applications of the "monstercat.com" website.

## Building

### Get Started

```
git clone git@github.com:monstercat/monstercat.com
cd monstercat.com
git checkout newschool
npm install
npm run watch
```

### More Commands

```
npm run clean
npm run build
```

### Commands to Add

```
npm run test
npm run distro
```

## Client

The client is writing in JavaScript and we use the Component package manager to build and organize our code.

The modules are written using LESS, Jade, and JavaScript. You are free to use whatever technology you want, but you must write the GNU Makefile to assemble your component in a `preprocess` target that will be called when we build the application.

## Server

The server is written using JavaScript in Node.js. We use Express for our HTTP server and URL function routing. HTML templates belong in `./server/templates` and route specific code belongs in `./server/routes`. 

The routes folder works in a special way. You don't require your route from this folder into the main application code. The main application opens all files in this folder and requires them and executes them as they should be a function. The Express app variable is passed through the function and this is where you can write your routes.