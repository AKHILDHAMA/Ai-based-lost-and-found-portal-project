const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const chatbotRoute = require("./routes/chatbot");
const activityRoutes = require("./routes/activityRoutes");
const recoveryStories = require("./routes/recoveryStories");
const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("joinRoom", (userEmail) => {
    socket.join(`user_${userEmail}`);
    console.log(`✅ Joined room: user_${userEmail}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ROUTES
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes")(io);
const uploadRoute = require("./routes/uploadRoute");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");


// 🔔 NEW NOTIFICATION ROUTES
const notificationRoutes = require("./routes/notificationRoutes")(io);

// REGISTER ROUTES
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api", recoveryStories);

// 🔔 REGISTER NOTIFICATION API
app.use("/api/notifications", notificationRoutes);

// ✅ CHATBOT ROUTE
app.use("/chatbot", chatbotRoute);

// STATIC FILES
app.use("/uploads", express.static("uploads"));

// START SERVER
server.listen(4000, () => {
  console.log("🚀 Server + Socket.IO running on port 4000");
});