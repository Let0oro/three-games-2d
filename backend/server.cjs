const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { generatePoetryEvaluation } = require("./games/poetry.cjs");
const { memoryserver } = require("./games/memory.cjs");
require("dotenv").config();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use(
  cors()
);

app.get("/memory", memoryserver);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("line", (data) => {
    console.log({ data });
    io.emit("line", data);
  });

  socket.on("evaluate", async (poem) => {
    const evaluation = await generatePoetryEvaluation(poem);
    io.emit("evaluation", evaluation);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
