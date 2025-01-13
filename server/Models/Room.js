// Here I have to make a model for the room 
const mongoose=require('mongoose');

const fileSchema = new mongoose.Schema({

    filename: {
        type: String,
    },
    content: {
        type: String, // Use String for storing text content. For binary files, use Buffer.
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const RoomSchema=new mongoose.Schema({
    RoomId: { type: String, },
    Files: [fileSchema]
})


const Room = mongoose.model('Room', RoomSchema);
module.exports = Room;