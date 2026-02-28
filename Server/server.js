// server.js
import express from "express";
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

const app = express();
const server = http.createServer(app);

/* ================================
   🔹 SOCKET.IO SETUP
================================ */
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["polling"] // Required for Vercel
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

/* ================================
   🔹 GLOBAL CORS HANDLER
================================ */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, token"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json({ limit: "4mb" }));

/* ================================
   🔹 ROUTES
================================ */
app.get("/api/status", (req, res) => {
  res.send("Server is live");
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

/* ================================
   🔹 DATABASE (Safe For Serverless)
================================ */

let isConnected = false;

const ensureDBConnection = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

app.use(async (req, res, next) => {
  await ensureDBConnection();
  next();
});

/* ================================
   🔹 LOCAL DEV ONLY
================================ */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log("Server running locally on port " + PORT)
  );
}

export default server;