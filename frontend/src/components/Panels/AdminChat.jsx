import React from "react";
import { Button } from "@mui/material";
import { SendHorizonal } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import { UserContext } from "../../context/UserContext";

const AdminChat = () => {
  const { serverURL } = useContext(StoreContext);
  const { User, authToken } = useContext(UserContext);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetSelectedChat = (chat) => {
    console.log(chat);
    setSelectedChat(chat);
  };

  useEffect(() => {
    const fetchChats = async () => {
      if (!User?.admin || User.admin.role !== "admin") return;
      try {
        const response = await fetch(`${serverURL}/api/chat/all-chats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch chats");
        if (data.success) setChats(data.data);
      } catch (err) {
        setError(err.message || "Failed to load chats");
      }
    };
    fetchChats();
    const interval = setInterval(fetchChats, 1000);
    return () => clearInterval(interval);
  }, [User, authToken, serverURL]);

  useEffect(() => {
    const fetchMessages = async () => {
      console.log("Live Chat Enabled in Admin");
      if (!selectedChat) return;
      try {
        const response = await fetch(`${serverURL}/api/chat/messages?chatId=${selectedChat._id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch messages");
        if (data.success) {
          setMessages(data.data);
          const unread = data.data.filter(msg => msg.from === "user" && msg.status === "send");
          if (unread.length > 0) {
            const unreadIds = unread.map(msg => msg._id);
            await fetch(`${serverURL}/api/chat/message/status`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
              },
              body: JSON.stringify({ messageIds: unreadIds }),
            }).then(res => res.json()).then(updated => {
              if (updated.success) {
                setMessages(messages => messages.map(msg =>
                  unreadIds.includes(msg._id) ? { ...msg, status: "seen" } : msg
                ));
              }
            });
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load messages");
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [selectedChat, authToken, serverURL]);

  const handleSend = async () => {
    if (!input.trim() || !User?.admin || User.admin.role !== "admin" || !selectedChat) return;
    setLoading(true);
    try {
      const response = await fetch(`${serverURL}/api/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          senderId: User.admin.id,
          content: input,
          from: "admin",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send message");
      if (data.success) {
        setMessages([...messages, data.data.message]);
        setChats(chats.map(chat =>
          chat._id === selectedChat._id ? { ...chat, updatedAt: new Date() } : chat
        ));
        setInput("");
      }
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full h-full">
        <div className="w-full h-full flex flex-col justify-start items-start gap-4">
          <div className="w-full flex justify-start items-center mt-2">
            <h1 className="font-bold text-xl text-neutral-800">Chats</h1>
          </div>
          <div className="w-full h-full flex justify-start items-start gap-4">
            <div className="w-sm h-full flex flex-col justify-start items-start gap-4 overflow-y-auto">
              {chats.map(chat => (
                <div
                  key={chat._id}
                  onClick={() => handleSetSelectedChat(chat)}
                  className={`hover:bg-neutral-100 duration-300 w-full h-auto p-4 
                  flex flex-col justify-start items-center border-b-[1px] border-b-neutral-300 cursor-pointer
                  ${selectedChat?._id === chat._id ? "bg-neutral-100" : ""}`}
                >
                  <div className="w-full flex justify-start items-center gap-2">
                    <p className="text-base text-neutral-800 font-semibold line-clamp-1">
                      {chat.userId ? chat.userId.name : "Unknown User"}
                    </p>
                    <div className="p Lot1 hidden bg-sky-100 rounded-full aspect-square">
                      <p className="text-xs text-sky-600 font-semibold">
                        {messages.filter(msg => msg.chatId === chat._id && msg.from === "user" && msg.status === "send").length}
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex justify-between items-center gap-2">
                    <p className="text-base text-neutral-800 font-normal line-clamp-1">
                      {messages.find(msg => msg.chatId === chat._id)?.content || "No messages yet"}
                    </p>
                    <p className="text-xs font-semibold">
                      {new Date(messages.find(msg => msg.chatId === chat._id)?.time || chat.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-lg min-h-svh max-h-svh border-l border-l-neutral-400">
              <div className="w-full flex flex-col gap-4 justify-between items-start h-full">
                {selectedChat == null ? (
                  <div className="w-full h-max flex grow flex-col gap-4 justify-start items-start p-4 overflow-y-auto">
                    <p className="text-red-500">No Chat Selected</p>
                  </div>
                ) : (
                  <>
                    <div className="w-full h-max flex grow flex-col gap-4 justify-start items-start p-4 overflow-y-auto">
                      {error && <p className="text-red-500">{error}</p>}
                      {messages.length === 0 ? (
                        <p className="text-neutral-600">No messages yet</p>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg._id}
                            className={`w-full flex ${msg.from === "user" ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-[70%] p-2 rounded-lg ${msg.from === "user" ? "bg-blue-100" : "bg-gray-100"}`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs text-neutral-500">
                                {new Date(msg.time).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="w-full sticky border-0 h-auto flex gap-4 justify-start items-start pb-4 px-4">
                      <input
                        type="text"
                        className="p-2 bg-neutral-200 outline-none w-full rounded-md"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        disabled={loading}
                        placeholder="Message..."
                      />
                      <Button
                        variant="contained"
                        className={`!bg-sky-800 hover:!bg-sky-900 !text-white !font-semibold !capitalize !py-2.5 !px-5 !text-sm`}
                        endIcon={<SendHorizonal strokeWidth={1.8} size={16} className="text-white" />}
                        onClick={handleSend}
                        disabled={loading}
                      >
                        Send
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminChat;