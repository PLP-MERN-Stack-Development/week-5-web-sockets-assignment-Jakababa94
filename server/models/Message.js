const mongoose = require ("mongoose");

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room"},
    content: {type: String, required: true },
    isPrivate: { type: Boolean, default: false},
}, { timestamps: true});

module.exports = mongoose.model("Message", messageSchema);