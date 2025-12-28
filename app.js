require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

const sequelize = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const videoRoutes = require("./src/routes/video.routes");

const app = express();
const server = http.createServer(app);

// 👇 Socket.io setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Make io accessible everywhere
app.set("io", io);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

sequelize.sync().then(() => {
  console.log("Database connected");
  server.listen(5000, () => {
    console.log("Server running on port 5000");
  });
});
