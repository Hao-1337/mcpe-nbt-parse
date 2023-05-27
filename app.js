/*
 Nodejs file for host web
 For https web you need SSL and certificate
 We are use express for this example
*/

const https = require('https'),
fs = require('fs'),
app = require('express')(),
path = require('path'),
session = require('cookie-session'),
port = 3000,
host = "192.168.1.9",
time = () => {
  let date = new Date();
  let [m,
    s,
    ms] = [date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()];
  return `[${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${m > 9 ? m: `0${m}`}:${s > 9 ? s: `0${s}`}:${ms > 99 ? ms: ms > 9 ? `0${ms}`: `00${ms}`}]`;
};


console.time(`Web host at http://${host}:${port}/`);
app.use(
  session({
    secret: "some secret",
    httpOnly: true,
    secure: true
  })
)
.get('/', (request, response) => {
  response.status(404);
  response.send(`Page not found`);
})
.get('/index.min.css/', (request, response) => {
  console.log(`${time()}Request for: ${request.url}`);
  response.setHeader('content-type', 'text/css');
  response.sendFile(__dirname + "/index.min.css");
})
.get('/nbt-editor.full.js/', (request, response) => {
  console.log(`${time()}Request for: ${request.url}`);
  response.setHeader('content-type', 'text/javascript');
  response.sendFile(__dirname + "/nbt.js");
})
.get('/nbt-editor.obf.js/', (request, response) => {
  console.log(`${time()}Request for: ${request.url}`);
  response.setHeader('content-type', 'text/javascript');
  response.sendFile(__dirname + "/nbt-editor.obf.js");
})
.get('/navigation.css/', (request, response) => {
  console.log(`${time()}Request for: ${request.url}`);
  response.setHeader('content-type', 'text/css');
  response.sendFile(__dirname + "/navigation.css");
})
.get('/app-theme/n-icon.png', (request, response) => {
  console.log(`${time()}Request for: ${request.url}`);
  response.setHeader('content-type', 'text/javascript');
  response.sendFile(__dirname + "/app-theme/n-icon.png");
})
.get('/index.html/', (request, response) => {
  console.log(`${time()}Request for: ${request.url}`);
  response.setHeader('content-type', 'text/html');
  response.sendFile(__dirname + "/index.html");
})
/* more 16 items... */
.listen(port,host,(error) => {
  if (error) console.error(`Error: can't listen website (error code: ${error.code})`);
  else console.timeEnd(`Web host at http://${host}:${port}/`);
});
