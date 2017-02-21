const express = require("express");
const http = require("http");
const bodyParser = require("body-parser"); // parses request to json
const morgan = require("morgan"); // logs incoming request for debugging
const router = require("./router");
const mongoose = require("mongoose");
const cors = require('cors');

// DB Setup
mongoose.connect("mongodb://localhost:auth/auth")

// Express App Setup
const app = express();
// app.use allows you to hook in middleware to every request
app.use(morgan("combined"));
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({ type: "/*/" }));
router(app);



// Server Setup - express to outside world
const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log("Server listening on port: ", port);
