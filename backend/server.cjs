const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { generatePoetryEvaluation } = require("./games/poetry.cjs");
const { memoryserver } = require("./games/memory.cjs");
require("dotenv").config();

const app = express();
const server = createServer(app);
let turnPlayers;
let totalPlayers = 0;

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use(cors());

app.get("/memory", memoryserver);

io.on("connection", (socket) => {
  console.log("A user connected");
  turnPlayers = 0;

  socket.on("newPlayer", () => {
    totalPlayers++;
  });

  socket.on("line", (data) => {
    io.emit("line", data);
    turnPlayers = (turnPlayers >= (totalPlayers-1) ? 0 : turnPlayers + 1);
  });

  socket.on("myTurn", () => io.emit("myTurn", totalPlayers));

  socket.on("getTurn", () => io.emit("getTurn", turnPlayers));

  socket.on("evaluate", async (poem) => {
    const evaluation = await generatePoetryEvaluation(poem);
    io.emit("evaluation", evaluation);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    totalPlayers--;
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
