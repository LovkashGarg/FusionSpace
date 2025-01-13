// server/server.js
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
// db se connect kar diya
require("./Util/Database").dbConnect();
app.use(cors());
app.use(express.json());

// let documentContent = ""; // Store the current document content
// let totalfile=[];
let allfiles = {};
const rooms = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  // Joining a room
  socket.on("joinRoom",async ({ roomId }) => {
    socket.join(roomId);

    // first room creation
    // Add user to room
    if (!rooms[roomId]) {
      rooms[roomId] = [];
      const createRoom = new Room({
        RoomId: roomId,
        Files: [],
      });
    }
    rooms[roomId].push(socket.id);

    // Notify others in the room about the new user
    socket.to(roomId).emit("userJoined", socket.id);

    // Send updated list of collaborators to everyone in the room
    io.to(roomId).emit("updateCollaborators", rooms[roomId]);
    
   try{
    // Send the current document content when a new client connects
    const room=await Room.findOne({RoomId:roomId});
    const allfiles=room.Files;
    if(room){
      socket.to(roomId).emit("AllFiles", allfiles);
    }
    }
    catch(err){
     console.log(" Error occured while connecting a user and Sending its file ",err)
    }
  });

  // socket.on("cursor-move", (data) => {
  //   // Broadcast to all other users in the same room
  //   socket.broadcast.to(data.roomId).emit("cursor-update", data);
  // });

  
  // socket.emit('filechange',file);

  socket.on("sendContent", async(filename,newContent,roomId) => {
    try{
       let room=await Room.findOne({RoomId:roomId});
       // if room exist 
       if(room){
         const fileindex=room.Files.findIndex((file)=>file.name===filename);
         //means file exist 
         if(fileindex!==-1){
             console.log(" content changed Successfully")
             room.Files[fileindex].content=newContent; 
         }
       }
    }catch(err){
      console.log("Error occured while changing the content of the file" ,err);
    }
     // Update the server's document content
    // Broadcast the updated content to all clients
    socket.to(roomId).emit("updateContent", newContent);
  });
  socket.on("filechange", async(newfile) => {
    const { filename, content, RoomID } = newfile; // Assuming newfile has `name` and `content`
    
    // console.log(RoomID);
    // Save the file data to the server or broadcast it to other users
   

    // Store the file content in `allfiles` dictionary
    allfiles[filename] = content;
    let room;
    try {
     room = await Room.findOne({ RoomId: RoomID });

      // means room Does not exist
      if (!room) {
        // created a
        room = new Room({
          RoomId: RoomID,
          Files: [{ name: filename, content: content }],
        });
      }
      // already room exist
      else {
        // I have a Room
        // console.log(" I have find a Room ", room);

      // Check if the file already exists in the room
      const fileIndex = room.Files.findIndex((file) => file.name === filename);
       console.log(fileIndex);
        if (fileIndex === -1) {
           room.Files.push({ name: filename, content: content });
        } else {
          // If file exists, update its content
          room.Files[fileIndex].content = content;
        }
      }
    } catch (err) {
      console.log(" An error Occured " + err);
    }
    
    // Broadcast the updated files list to all clients
    // Broadcast the updated file list to all clients in the room
    room.save();
    socket.to(RoomID).emit("AllFiles", room.Files);
    // console.log(room.Files);
    socket.to(RoomID).emit("fileReceived", newfile);
    console.log(`Updated files:`, newfile);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

});

const PORT = process.env.PORT || 4000;

app.post("/api/generate", async (req, res) => {
  // return res.json("Hello bro");
  // console.log("hello" + process.env.GEMINI_KEY_ID);
  try {
    //   console.log(req.body);
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_KEY_ID}`,
      req.body
    );
    //   console.log(req.body);
    //   console.log(response.data.candidates[0].content.parts[0].text);
    res.json(response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    res.status(500).json({ message: "Error fetching the answer" });
  }
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
