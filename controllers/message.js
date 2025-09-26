import Message from "../models/message.js";
import User from "../models/user.js";
import Chat from "../models/chat.js";
import { StatusCodes } from "http-status-codes";
import path from "path";
import { fileURLToPath } from "url";

import { BadRequestError } from "../errors/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendMessage = async (req, res) => {
  const { message, chatId, type = "text" } = req.body;

  if (!chatId) {
    return BadRequestError("Please Provide Chat ID");
  }

  // For text messages, message content is required
  if (type === "text" && !message) {
    return BadRequestError("Please Provide Message Content");
  }

  // For image/sticker messages, file is required
  if ((type === "image" || type === "sticker") && !req.file) {
    return BadRequestError("Please Provide File");
  }

  let newMessage = {
    sender: req.user.id,
    message: message || "",
    chat: chatId,
    type: type,
  };

  // Add media URL if file is uploaded
  if (req.file) {
    // Determine the subdirectory based on file type
    let subDir = '';
    if (req.file.destination.includes('images')) {
      subDir = 'images';
    } else if (req.file.destination.includes('stickers')) {
      subDir = 'stickers';
    }
    
    // Use relative path so it goes through the React proxy
    newMessage.mediaUrl = `/uploads/${subDir}/${req.file.filename}`;
    
    console.log("File uploaded successfully:", newMessage.mediaUrl);
  }

  let m = await Message.create(newMessage);

  m = await m.populate("sender", "username avatar");
  m = await m.populate("chat");
  m = await User.populate(m, {
    path: "chat.users",
    select: "username avatar email _id",
  });

  await Chat.findByIdAndUpdate(chatId, { latestMessage: m }, { new: true });

  res.status(StatusCodes.OK).json(m);
};

const allMessages = async (req, res) => {
  const { chatId } = req.params;

  const getMessage = await Message.find({ chat: chatId })
    .populate("sender", "username avatar email _id")
    .populate("chat");


  res.status(StatusCodes.OK).json(getMessage);
};

export { allMessages, sendMessage };
