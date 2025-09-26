import { Avatar, Tooltip, Image, Box, Text } from "@chakra-ui/react";
import React, { useRef, useEffect } from "react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/chat";
import { useAppContext } from "../context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = useAppContext();

  const messagesEndRef = useRef(null);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    // If message is from today, show time only
    if (diffInHours < 24 && date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If message is from yesterday, show "Yesterday" and time
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If message is older, show date and time
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip
                label={m.sender.username}
                placement="bottom-start"
                hasArrow
              >
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.username}
                  src={m.sender.avatar}
                />
              </Tooltip>
            )}
            <Box
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}
            >
              {m.type === "image" && m.mediaUrl ? (
                <Box>
                  <Image
                    src={m.mediaUrl}
                    alt="Shared image"
                    maxH="300px"
                    maxW="250px"
                    objectFit="contain"
                    borderRadius="10px"
                    fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4="
                    onError={(e) => {
                      console.error("Image failed to load:", m.mediaUrl);
                    }}
                  />
                  {m.message && (
                    <Box mt={2} fontSize="sm">
                      {m.message}
                    </Box>
                  )}
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mt={1}
                    textAlign="right"
                    fontStyle="italic"
                  >
                    {formatTime(m.createdAt)}
                  </Text>
                </Box>
              ) : m.type === "sticker" && m.mediaUrl ? (
                <Box>
                  <Image
                    src={m.mediaUrl}
                    alt="Shared sticker"
                    maxH="150px"
                    maxW="150px"
                    objectFit="contain"
                    borderRadius="10px"
                    fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlN0aWNrZXIgbm90IGZvdW5kPC90ZXh0Pjwvc3ZnPg=="
                    onError={(e) => {
                      console.error("Sticker failed to load:", m.mediaUrl);
                    }}
                  />
                  {m.message && (
                    <Box mt={2} fontSize="sm">
                      {m.message}
                    </Box>
                  )}
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mt={1}
                    textAlign="right"
                    fontStyle="italic"
                  >
                    {formatTime(m.createdAt)}
                  </Text>
                </Box>
              ) : (
                <Box>
                  <span>{m.message}</span>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mt={1}
                    textAlign="right"
                    fontStyle="italic"
                  >
                    {formatTime(m.createdAt)}
                  </Text>
                </Box>
              )}
            </Box>
          </div>
        ))}
      <div ref={messagesEndRef}></div>
    </div>
  );
};

export default ScrollableChat;
