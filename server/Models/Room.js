// Here I have to make a model for the room 
const mongoose=require('mongoose');

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    content: {
        type: String, // Use String for storing text content. For binary files, use Buffer.
        required: true,
    },
});

const RoomSchema=new mongoose.Schema({
    RoomId: { type: String, required: true },
    Files: [fileSchema]
})


const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;