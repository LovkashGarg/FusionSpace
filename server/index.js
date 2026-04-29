const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const Room = require("./Models/Room");
require("./Util/Database").dbConnect();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// rooms[roomId] = [socketId, ...]
const rooms = {};
const userNames = {}; // { socketId: username }

function normalizeTimestamp(value) {
  const ts = Number(value);
  return Number.isFinite(ts) ? ts : Date.now();
}

function toMillis(value) {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
}

async function applyLwwUpdate({
  roomId,
  filename,
  content,
  updatedAt,
  allowCreateRoom,
}) {
  if (!roomId || !filename) {
    return { applied: false, reason: "invalid_payload" };
  }

  const incomingTs = normalizeTimestamp(updatedAt);

  let room = await Room.findOne({ RoomId: roomId });

  if (!room) {
    if (!allowCreateRoom) {
      return { applied: false, reason: "room_not_found", incomingTs };
    }

    room = new Room({
      RoomId: roomId,
      Files: [
        {
          filename,
          content: content ?? "",
          createdAt: new Date(incomingTs),
          updatedAt: new Date(incomingTs),
        },
      ],
    });

    await room.save();
    return { applied: true, incomingTs };
  }

  if (!Array.isArray(room.Files)) {
    room.Files = [];
  }

  const fileIndex = room.Files.findIndex((file) => file.filename === filename);

  if (fileIndex === -1) {
    if (!allowCreateRoom) {
      return { applied: false, reason: "file_not_found", incomingTs };
    }

    room.Files.push({
      filename,
      content: content ?? "",
      createdAt: new Date(incomingTs),
      updatedAt: new Date(incomingTs),
    });

    await room.save();
    return { applied: true, incomingTs };
  }

  const currentTs = toMillis(room.Files[fileIndex].updatedAt);

  if (incomingTs >= currentTs) {
    room.Files[fileIndex].content = content ?? "";
    room.Files[fileIndex].updatedAt = new Date(incomingTs);
    await room.save();
    return { applied: true, incomingTs };
  }

  return {
    applied: false,
    reason: "stale_update",
    incomingTs,
    currentTs,
  };
}

// Track which room each socket is in so we can notify on disconnect
const socketRoomMap = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // In the joinRoom handler, replace the existing block:
socket.on("joinRoom", async ({ roomId, username } = {}) => {
  if (!roomId) return;

  socket.join(roomId);
  socketRoomMap[socket.id] = roomId;
  userNames[socket.id] = username || socket.id; // store the name

  if (!rooms[roomId]) rooms[roomId] = [];
  if (!rooms[roomId].includes(socket.id)) rooms[roomId].push(socket.id);

  // Broadcast name to others, not just the socket.id
  socket.to(roomId).emit("userJoined", {
    userId: socket.id,
    username: userNames[socket.id],
  });

  io.to(roomId).emit("updateCollaborators", 
    rooms[roomId].map((id) => ({ id, username: userNames[id] || id }))
  );

  try {
    let room = await Room.findOne({ RoomId: roomId });
    if (!room) {
      room = new Room({ RoomId: roomId, Files: [] });
      await room.save();
    }
    socket.emit("AllFiles", room.Files);
  } catch (err) {
    console.log("Error while connecting user and sending files:", err);
  }
});

// In the disconnect handler, clean up the name:
socket.on("disconnect", () => {
  const roomId = socketRoomMap[socket.id];
  if (roomId) {
    socket.to(roomId).emit("userLeft", socket.id);
    delete socketRoomMap[socket.id];
  }
  delete userNames[socket.id]; // clean up name

  for (const rid in rooms) {
    rooms[rid] = rooms[rid].filter((id) => id !== socket.id);
    if (rooms[rid].length === 0) delete rooms[rid];
  }
});

  socket.on("sendContent", async (payload = {}) => {
    const { roomId, filename, newContent, updatedAt } = payload;

    try {
      const result = await applyLwwUpdate({
        roomId,
        filename,
        content: newContent,
        updatedAt,
        allowCreateRoom: false,
      });

      if (result.applied) {
        // Broadcast to everyone in the room including the sender
        // so all tabs/clients stay in sync
        io.to(roomId).emit("updateContent", {
          filename,
          content: newContent ?? "",
          updatedAt: result.incomingTs,
        });
      }
    } catch (err) {
      console.log("Error while updating file content:", err);
    }
  });

  socket.on("filechange", async (payload = {}) => {
    const { RoomID, filename, content, updatedAt } = payload;
    const roomId = RoomID;

    try {
      const result = await applyLwwUpdate({
        roomId,
        filename,
        content,
        updatedAt,
        allowCreateRoom: true,
      });

      if (result.applied) {
        io.to(roomId).emit("filechange", {
          filename,
          content: content ?? "",
          updatedAt: result.incomingTs,
        });
      }
    } catch (err) {
      console.error("Error while handling filechange:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // FIX 2: Emit userLeft to the room this socket was in,
    // so all other clients remove it from the collaborator list.
    const roomId = socketRoomMap[socket.id];
    if (roomId) {
      socket.to(roomId).emit("userLeft", socket.id);
      delete socketRoomMap[socket.id];
    }

    for (const rid in rooms) {
      rooms[rid] = rooms[rid].filter((id) => id !== socket.id);
      if (rooms[rid].length === 0) {
        delete rooms[rid];
      }
    }
  });
});

app.get("/allFilesdata/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findOne({ RoomId: roomId });

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, files: room.Files });
  } catch (error) {
    console.error("Error fetching files:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch files" });
  }
});

app.post("/api/generate", async (req, res) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_KEY_ID}`,
      req.body
    );

    res.json(response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    res.status(500).json({ message: "Error fetching the answer" });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});