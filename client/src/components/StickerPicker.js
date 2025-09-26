import React from "react";
import { Box, Image, SimpleGrid, Button } from "@chakra-ui/react";

const StickerPicker = ({ onStickerSelect }) => {
  // Sample sticker URLs - in a real app, these would be from your server
  const stickers = [
    "https://cdn-icons-png.flaticon.com/512/742/742751.png", // Happy face
    "https://cdn-icons-png.flaticon.com/512/742/742752.png", // Sad face
    "https://cdn-icons-png.flaticon.com/512/742/742753.png", // Love
    "https://cdn-icons-png.flaticon.com/512/742/742754.png", // Thumbs up
    "https://cdn-icons-png.flaticon.com/512/742/742755.png", // Thumbs down
    "https://cdn-icons-png.flaticon.com/512/742/742756.png", // Fire
    "https://cdn-icons-png.flaticon.com/512/742/742757.png", // Heart
    "https://cdn-icons-png.flaticon.com/512/742/742758.png", // Star
    "https://cdn-icons-png.flaticon.com/512/742/742759.png", // Party
  ];

  const handleStickerClick = (stickerUrl) => {
    // Create a file object from the URL
    fetch(stickerUrl)
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], "sticker.png", { type: "image/png" });
        onStickerSelect(file);
      })
      .catch(error => {
        console.error("Error loading sticker:", error);
      });
  };

  return (
    <Box p={4}>
      <SimpleGrid columns={3} spacing={4}>
        {stickers.map((sticker, index) => (
          <Button
            key={index}
            variant="ghost"
            p={2}
            onClick={() => handleStickerClick(sticker)}
            _hover={{ bg: "gray.100" }}
          >
            <Image
              src={sticker}
              alt={`Sticker ${index + 1}`}
              boxSize="50px"
              objectFit="contain"
            />
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default StickerPicker;
