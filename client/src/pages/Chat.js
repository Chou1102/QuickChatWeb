import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/ChatProvider";
import { SideDrawer, MyChats, ChatBox } from "../components";
import { Box, Spinner, Center, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { getUserFromLocalStorage } from "../utils/localStorage";

const Chat = () => {
  const { user, loading } = useAppContext();
  const [fetchAgain, setFetchAgain] = useState(false);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  // If no user after loading, show a message or redirect
  if (!user) {
    return (
      <Center h="100vh">
        <Text>Redirecting to login...</Text>
      </Center>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <SideDrawer />
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        <MyChats fetchAgain={fetchAgain} />
        <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      </Box>
    </div>
  );
};

export default Chat;
