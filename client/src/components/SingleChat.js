import { ArrowBackIcon, AttachmentIcon, StarIcon, ArrowForwardIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  Button,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Image,
  Text as ChakraText,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getSender, getSenderFull } from "../config/chat";
import { useAppContext } from "../context/ChatProvider";
import api from "../utils/axios";
import ProfileModal from "./ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModel from "./UpdateGroupChatModel";
import StickerPicker from "./StickerPicker";
import FileBase64 from "react-file-base64";

import io from "socket.io-client";

let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isStickerOpen, onOpen: onStickerOpen, onClose: onStickerClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);

      const { data } = await api.get(`/api/v1/message/${selectedChat._id}`);

      setMessages(data);
      setLoading(false);
      socket.emit("join-chat", selectedChat._id);
    } catch (error) {
      toast.error(error);
    }
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      await handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    socket.emit("stop-typing", selectedChat._id);
    try {
      const { data } = await api.post(`/api/v1/message/`, {
        message: newMessage,
        chatId: selectedChat._id,
      });

      setNewMessage("");
      socket.emit("new-message", data);
      setMessages([...messages, data]);
    } catch (error) {
      toast.error(error);
    }
  };

  const sendImage = async () => {
    if (!selectedImage) return;
    
    setUploading(true);
    try {
      // Convert base64 to File object
      const response = await fetch(selectedImage.base64);
      const blob = await response.blob();
      const file = new File([blob], selectedImage.name || "image.jpg", { type: blob.type });

      const formData = new FormData();
      formData.append("image", file);
      formData.append("chatId", selectedChat._id);
      formData.append("type", "image");
      formData.append("message", ""); // Add empty message for image type

      const { data } = await api.post(`/api/v1/message/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Image sent successfully:", data.mediaUrl);
      setSelectedImage(null);
      onClose();
      socket.emit("new-message", data);
      setMessages([...messages, data]);
      toast.success("Image sent successfully!");
    } catch (error) {
      toast.error("Failed to send image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };


  const handleStickerSelect = async (stickerFile) => {
    setSelectedSticker(stickerFile);
    setShowStickerPicker(false);
    onStickerClose(); // Close the sticker modal
    
    // Automatically send the sticker
    setUploading(true);
    try {
      let file;
      
      // Handle different sticker sources
      if (stickerFile.base64) {
        // From FileBase64 component
        const response = await fetch(stickerFile.base64);
        const blob = await response.blob();
        file = new File([blob], stickerFile.name || "sticker.png", { type: blob.type });
      } else {
        // From StickerPicker (already a File object)
        file = stickerFile;
      }

      const formData = new FormData();
      formData.append("sticker", file);
      formData.append("chatId", selectedChat._id);
      formData.append("type", "sticker");
      formData.append("message", ""); // Add empty message for sticker type

      const { data } = await api.post(`/api/v1/message/sticker`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Sticker sent successfully:", data.mediaUrl);
      setSelectedSticker(null);
      socket.emit("new-message", data);
      setMessages([...messages, data]);
      toast.success("Sticker sent!");
    } catch (error) {
      toast.error("Failed to send sticker");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedChat) return;
    
    setDeleting(true);
    try {
      await api.delete(`/api/v1/chat/${selectedChat._id}`);
      toast.success("Chat deleted successfully");
      setSelectedChat("");
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toast.error("Failed to delete chat");
      console.error("Error deleting chat:", error);
    } finally {
      setDeleting(false);
      onDeleteClose();
    }
  };

  useEffect(() => {
    socket = io(process.env.REACT_APP_SOCKET_ENDPOINT);
    socket.emit("setup", user);
    
    socket.on("connected", () => setSocketConnected(true));

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop-typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  // Force refresh messages when component mounts to get latest data
  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, []);

  useEffect(() => {
    socket.on("message-received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // notification
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop-typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Poppins"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <HStack spacing={2}>
                  <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                  <IconButton
                    aria-label="Delete chat"
                    icon={<DeleteIcon />}
                    onClick={onDeleteOpen}
                    colorScheme="red"
                    variant="ghost"
                    title="Delete Chat"
                    size="sm"
                  />
                </HStack>
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <HStack spacing={2}>
                  <UpdateGroupChatModel
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessages={fetchMessages}
                  />
                  {selectedChat.groupAdmin === user._id && (
                    <IconButton
                      aria-label="Delete group chat"
                      icon={<DeleteIcon />}
                      onClick={onDeleteOpen}
                      colorScheme="red"
                      variant="ghost"
                      title="Delete Group Chat"
                      size="sm"
                    />
                  )}
                </HStack>
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            position="relative"
          >
            {/* Messages Area */}
            <Box
              flex="1"
              overflowY="auto"
              pb={3}
              minH="0"
            >
              {loading ? (
                <Spinner
                  size="xl"
                  w={20}
                  h={20}
                  alignSelf="center"
                  margin="auto"
                />
              ) : (
                <div className="message">
                  <ScrollableChat messages={messages} />
                </div>
              )}
            </Box>
            
            {/* Typing Indicator */}
            {isTyping && (
              <Box px={3} py={1}>
                <Text fontSize="sm" color="gray.500">Typing ...</Text>
              </Box>
            )}
            
            {/* Fixed Input Bar */}
            <Box
              position="sticky"
              bottom="0"
              bg="#E8E8E8"
              pt={3}
              borderTop="1px solid #D0D0D0"
            >
              <FormControl onKeyDown={sendMessage} isRequired>
                <HStack>
                  <Input
                    variant="filled"
                    bg="#E0E0E0"
                    placeholder="Enter a message.."
                    value={newMessage}
                    onChange={typingHandler}
                  />
                  <IconButton
                    aria-label="Send message"
                    icon={<ArrowForwardIcon />}
                    onClick={handleSendMessage}
                    colorScheme="blue"
                    variant="solid"
                    title="Send Message"
                    isDisabled={!newMessage.trim()}
                  />
                  <IconButton
                    aria-label="Send sticker"
                    icon={<StarIcon />}
                    onClick={onStickerOpen}
                    colorScheme="purple"
                    variant="ghost"
                    title="Send Sticker"
                  />
                  <IconButton
                    aria-label="Attach file"
                    icon={<AttachmentIcon />}
                    onClick={onOpen}
                    colorScheme="blue"
                    variant="ghost"
                    title="Send Image"
                  />
                </HStack>
              </FormControl>
            </Box>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Poppins">
            Click On Users to Start Conversation
          </Text>
        </Box>
      )}

      {/* Image Upload Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box w="100%">
                <ChakraText mb={2} fontWeight="bold">Choose an image to send</ChakraText>
                <FileBase64
                  multiple={false}
                  onDone={(file) => setSelectedImage(file)}
                />
                {selectedImage && (
                  <Box mt={2}>
                    <Image
                      src={selectedImage.base64}
                      alt="Selected"
                      maxH="200px"
                      maxW="200px"
                      objectFit="contain"
                      borderRadius="10px"
                    />
                    <Button
                      colorScheme="blue"
                      size="sm"
                      mt={2}
                      onClick={sendImage}
                      isLoading={uploading}
                      loadingText="Sending..."
                    >
                      Send Image
                    </Button>
                  </Box>
                )}
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Sticker Picker Modal */}
      <Modal isOpen={isStickerOpen} onClose={onStickerClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Choose a Sticker
            {uploading && (
              <ChakraText fontSize="sm" color="gray.500" fontWeight="normal">
                Sending sticker...
              </ChakraText>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box w="100%">
                <ChakraText mb={2} fontWeight="bold">
                  Click any sticker to send it instantly
                </ChakraText>
                <StickerPicker onStickerSelect={handleStickerSelect} />
              </Box>
              
              <Box w="100%" borderTop="1px" borderColor="gray.200" pt={4}>
                <ChakraText mb={2} fontWeight="bold">Or upload your own sticker</ChakraText>
                <FileBase64
                  multiple={false}
                  onDone={(file) => handleStickerSelect(file)}
                />
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Chat Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <ChakraText>
                Are you sure you want to delete this chat? This action cannot be undone and will permanently remove all messages in this chat.
              </ChakraText>
              <HStack spacing={3} w="100%">
                <Button
                  colorScheme="red"
                  onClick={handleDeleteChat}
                  isLoading={deleting}
                  loadingText="Deleting..."
                  flex={1}
                >
                  Delete Chat
                </Button>
                <Button
                  variant="ghost"
                  onClick={onDeleteClose}
                  flex={1}
                  isDisabled={deleting}
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SingleChat;
