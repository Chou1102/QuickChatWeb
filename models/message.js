import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    type: {
      type: String,
      enum: ["text", "image", "sticker"],
      default: "text",
    },
    mediaUrl: { type: String }, // link ảnh hoặc sticker
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
