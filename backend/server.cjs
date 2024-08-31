const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const axios = require("axios");
const { generatePoetryEvaluation } = require("./games/poetry.cjs");
const { memoryserver } = require("./games/memory.cjs");
require("dotenv").config();

const app = express();
const server = createServer(app);
const io = new Server();

io.attach(server)

app.use(cors());
app.use(express.json());
// app.use(express.static("src/dist"));

app.get("/memory", memoryserver);

io.on('connection', (socket) => {
    console.log("An use connected")
    socket.on('line', (data) => {
        console.log({data})
        io.emit('line', data);
    });

    socket.on('evaluate', (poem) => {
        const evaluation = generatePoetryEvaluation(poem);
        io.emit('evaluation', evaluation);
    });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
