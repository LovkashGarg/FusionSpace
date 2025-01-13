const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const Room = require("./Models/Room");
require("dotenv").config();
const axios = require("axios");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for development purposes
    methods: ["GET", "POST"],
  },
});

// DB connection
require("./Util/Database").dbConnect();

app.use(cors());
app.use(express.json());

const rooms = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle room joining
  socket.on("joinRoom", async ({ roomId }) => {
    socket.join(roomId);

    // Initialize room if not already created
    if (!rooms[roomId]) {
      rooms[roomId] = [];
      const createRoom = new Room({
        RoomId: roomId,
        Files: [],
      });
      await createRoom.save();
    }
    rooms[roomId].push(socket.id);

    // Notify others in the room
    socket.to(roomId).emit("userJoined", socket.id);

    // Update collaborators list
    io.to(roomId).emit("updateCollaborators", rooms[roomId]);

    try {
      // Fetch existing files for the room
      const room = await Room.findOne({ RoomId: roomId });
      if (room) {
        socket.emit("AllFiles", room.Files);
      }
    } catch (err) {
      console.log("Error while connecting user and sending files:", err);
    }
  });

  // Handle content update for a file
  socket.on("sendContent", async ({ roomId, filename, newContent }) => {
    try {
      
      console.log("Content update event received:", roomId, filename, newContent);
      const room = await Room.findOne({ RoomId: roomId });

      if (room) {
        const fileIndex = room.Files.findIndex((file) => file.filename === filename);

        if (fileIndex !== -1) {
          room.Files[fileIndex].content = newContent;
          await room.save();

          console.log("Content updated successfully");
          io.to(roomId).emit("updateContent", { filename, content: newContent });
        }
      }

    } catch (err) {
      console.log("Error while updating file content:", err);
    }
  });

  // Handle file change (create or update)
  socket.on("filechange", async ({ RoomID, filename, content }) => {
    console.log("File change event received:", RoomID, filename, content);
    try {
      let room = await Room.findOne({ RoomId: RoomID });
  
      if (!room) {
        // If the room doesn't exist, create it
        room = new Room({
          RoomId: RoomID,
          Files: [{ filename: filename, content }],
        });
      } else {
        // If room exists, check if the file exists
        const fileIndex = room.Files.findIndex((file) => file.filename === filename);
  
        if (fileIndex === -1) {
          // Add new file if it doesn't exist
          room.Files.push({ filename: filename, content });
        } else {
          // Update existing file's content
          room.Files[fileIndex].content = content;
          room.Files[fileIndex].createdAt = new Date(); // Update the timestamp
        }
      }
  
      // Save the changes
      await room.save();
  
      // Broadcast the updated files list to all clients (including the sender)
      io.to(RoomID).emit("filechange", { filename, content });

      // console.log(`Updated files:`, room.Files);
    } catch (err) {
      console.error("Error while handling filechange:", err);
    }
  });
  

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Optionally, remove the socket ID from `rooms` here
  });
});

// REST API to fetch all files for a room
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

// Example API route for external integration
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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
