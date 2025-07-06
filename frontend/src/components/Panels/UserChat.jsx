import React from "react";

import { Button } from "@mui/material";
import { SendHorizonal } from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { StoreContext } from "../../context/StoreContext";
import { UserContext } from "../../context/UserContext";

const UserChat = () => {
  const { serverURL } = useContext(StoreContext);
  const { User, authToken } = useContext(UserContext);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChat = async () => {
      if (!User?.user || User.user.role !== "user") return;
      try {
        const response = await fetch(`${serverURL}/api/chat/user-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
          body: JSON.stringify({ userId: User.user.id }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch chat");
        if (data.success && data.data) setChatId(data.data._id);
      } catch (err) {
        setError(err.message || "Failed to load chat");
      }
    };
    fetchChat();
  }, [User, authToken, serverURL]);

  useEffect(() => {
    const fetchMessages = async () => {
      console.log("Live Chat Enabled")
      if (!chatId) return;
      try {
        const response = await fetch(`${serverURL}/api/chat/messages?chatId=${chatId}`, {
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
          const unread = data.data.filter(msg => msg.from === "admin" && msg.status === "send");
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
  }, [chatId, authToken, serverURL]);

  const handleSend = async () => {
    if (!input.trim() || !User?.user || User.user.role !== "user") return;
    setLoading(true);
    try {
      const response = await fetch(`${serverURL}/api/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          chatId,
          senderId: User.user.id,
          content: input,
          from: "user",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send message");
      if (data.success) {
        setMessages([...messages, data.data.message]);
        setChatId(data.data.chatId);
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
        <div className="w-full flex flex-col justify-start items-center mt-2">
          <div className="w-full flex justify-start items-center mt-2">
            <h1 className="font-bold text-xl text-neutral-800">My Chat</h1>
          </div>
          <div className="w-lg min-h-svh max-h-svh mx-auto ">
            <div className="w-full flex flex-col gap-4 justify-between items-start h-full">
              <div className="w-full h-max flex grow flex-col gap-4 justify-start items-start p-4 overflow-y-auto">
                {error && <p className="text-red-500">{error}</p>}
                {messages.length === 0 ? (
                  <p className="text-neutral-600">No messages yet</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`w-full flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserChat;