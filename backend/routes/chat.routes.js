import express from 'express';
import { getUserChat, getAllChats, getChatMessages, sendMessage, updateMessageStatus, getUnreadMessages, deleteChat } from '../controllers/chat.controller.js';

const chatRouter = express.Router();

chatRouter.post('/user-chat', getUserChat);
chatRouter.get('/all-chats', getAllChats);
chatRouter.get('/messages', getChatMessages);
chatRouter.post('/send', sendMessage);
chatRouter.post('/message/status', updateMessageStatus);
chatRouter.post('/unread', getUnreadMessages);
chatRouter.post('/delete', deleteChat);

export default chatRouter;