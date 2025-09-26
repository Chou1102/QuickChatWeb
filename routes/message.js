import express from "express";
import { allMessages, sendMessage } from "../controllers/message.js";
import { uploadImage, uploadSticker } from "../middleware/upload.js";
const router = express.Router();

router.route("/:chatId").get(allMessages);
router.route("/").post(sendMessage);
router.route("/image").post(uploadImage.single("image"), sendMessage);
router.route("/sticker").post(uploadSticker.single("sticker"), sendMessage);

export default router;
