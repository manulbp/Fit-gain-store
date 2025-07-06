import express from 'express'
import { closeTicket, createTicket, getAllTickets, getTicketTypes, getUserTickets, resolveTicket, startTicketProgress } from '../controllers/ticket.controller.js'

const ticketRouter = express.Router()

ticketRouter.get('/types',getTicketTypes)
ticketRouter.post('/create',createTicket)
ticketRouter.post('/user-tickets', getUserTickets);
ticketRouter.post('/close', closeTicket);
ticketRouter.get('/all', getAllTickets);
ticketRouter.post('/start-progress', startTicketProgress);
ticketRouter.post('/resolve', resolveTicket);

export default ticketRouter