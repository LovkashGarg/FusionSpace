const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const RoomSchema = new mongoose.Schema({
  RoomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  Files: {
    type: [fileSchema],
    default: [],
  },
});

const Room = mongoose.model("Room", RoomSchema);
module.exports = Room;