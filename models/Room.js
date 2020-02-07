const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomSchema = new Schema({
  description: String,
  name: String,
  price: String
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
