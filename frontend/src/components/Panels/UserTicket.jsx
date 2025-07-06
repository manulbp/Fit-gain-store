import React from "react";
import { Button, FormControl, InputLabel, MenuItem, Modal, Select, TextField } from "@mui/material";
import { Plus } from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { StoreContext } from "../../context/StoreContext";
import { UserContext } from "../../context/UserContext";

const UserTicket = () => {
  const { ticketTypes, serverURL } = useContext(StoreContext);
  const { User, authToken } = useContext(UserContext);
  const [openTicketModal, setOpenTicketModal] = useState(false);
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      if (!User?.user) return;
      try {
        const response = await fetch(`${serverURL}/api/ticket/user-tickets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
          body: JSON.stringify({ userId: User.user.id }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch tickets");
        if (data.success) setTickets(data.data);
      } catch (err) {
        setFetchError(err.message || "Failed to load tickets");
      }
    };
    fetchTickets();
  }, [User, authToken, serverURL]);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    if (!ticketTypeId || !description) {
      setError("Please select a ticket type and enter a description.");
      setLoading(false);
      return;
    }
    if (!User?.user) {
      setError("You must be logged in to submit a ticket.");
      setLoading(false);
      return;
    }
    const userId = User?.user?.id;
    try {
      const response = await fetch(`${serverURL}/api/ticket/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ ticketTypeId, description, userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to submit ticket");
      if (data.success) {
        setTickets([data.data, ...tickets]);
        setTicketTypeId("");
        setDescription("");
        setOpenTicketModal(false);
      } else {
        throw new Error(data.message || "Ticket submission failed");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    if (!User?.user) return;
    const userId = User.user.id;
    try {
      const response = await fetch(`${serverURL}/api/ticket/close`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ ticketId, userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to close ticket");
      if (data.success) {
        setTickets(tickets.map(ticket =>
          ticket._id === ticketId ? { ...ticket, status: "Closed" } : ticket
        ));
      } else {
        throw new Error(data.message || "Failed to close ticket");
      }
    } catch (err) {
      setFetchError(err.message || "Failed to close ticket");
    }
  };

  return (
    <>
      <div className="w-full h-full">
        <div className="w-full flex flex-col gap-4 justify-start items-start ">
          <div className="w-full flex flex-col gap-4 justify-start items-start ">
            <div className="w-full flex justify-between items-center mt-2">
              <h1 className="font-bold text-xl text-neutral-800">My Tickets</h1>
              <Button variant="contained" onClick={() => setOpenTicketModal(!openTicketModal)}
                className={`!bg-sky-800 hover:!bg-sky-900 !text-white !font-semibold !capitalize !text-sm`}
                startIcon={<Plus strokeWidth={1.8} className="text-white" />}>
                Open Ticket
              </Button>
            </div>
          </div>
          <div className="w-full flex flex-col gap-4 justify-start items-start ">
            {fetchError && <p className="text-red-500 text-sm">{fetchError}</p>}
            {tickets.length === 0 && !fetchError ? (
              <p className="text-neutral-600">No tickets found.</p>
            ) : (
              tickets.map((ticket, index) => (
                <div key={ticket._id} className="w-full hover:bg-neutral-100 py-2 px-1 duration-300 transition-colors
                flex justify-start items-center gap-1 border-b border-b-neutral-600 pb-1">
                  <p className="w-10">{index + 1}</p>
                  <div className="w-full flex flex-col justify-start items-start gap-1">
                    <div className={`w-full flex justify-between items-center gap-10 
                    ${ticket.reply && "border-b border-b-neutral-300 pb-1"}`}>
                      <div className="w-auto flex justify-start items-center gap-10">
                        <p className="font-normal w-auto text-neutral-600">{ticket.ticketTypeId.name}</p>
                        <p className="font-semibold text-neutral-800 line-clamp-1">{ticket.description}</p>
                      </div>
                      <div className="min-w-auto flex justify-end items-center gap-5">
                        <div className={`p-1 min-w-auto
                          ${ticket.status === "Pending" ? "bg-yellow-100" : "bg-neutral-200"}
                          ${ticket.status === "In Progress" ? "bg-sky-100" : "bg-neutral-200"}
                          ${ticket.status === "Resolved" ? "bg-yellow-100" : "bg-neutral-200"}
                          ${ticket.status === "Closed" ? "bg-red-100" : "bg-neutral-200"}
                          `}>
                          <p className={`text-xs min-w-auto capitalize font-semibold
                            ${ticket.status === "Pending" ? "text-yellow-600" : "text-neutral-600"} 
                            ${ticket.status === "In Progress" ? "text-sky-600" : "text-neutral-600"} 
                            ${ticket.status === "Resolved" ? "text-green-600" : "text-neutral-600"} 
                            ${ticket.status === "Closed" ? "text-red-600" : "text-neutral-600"} 
                            `}>
                            {ticket.status}
                          </p>
                        </div>
                        {ticket.status === "Resolved" && (
                          <button variant="contained"
                            className={`text-red-600 bg-red-100 p-1 cursor-pointer text-xs min-w-auto capitalize font-semibold`}
                            onClick={() => handleCloseTicket(ticket._id)}>
                            Close This Ticket
                          </button>
                        )}
                      </div>
                    </div>
                    {ticket.reply && (
                      <div onClick={() => ticket.status === "Resolved" && handleCloseTicket(ticket._id)}
                        className="w-full flex gap-16 justify-start items-start">
                        <p className="font-normal text-neutral-600">Reply</p>
                        <p className="font-semibold text-neutral-800">{ticket.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Modal
        open={openTicketModal}
        onClose={() => setOpenTicketModal(!openTicketModal)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="fixed inset-0 rounded-md p-5 bg-white w-sm h-fit mx-auto my-auto">
          <div className="w-full flex flex-col justify-start items-start gap-4">
            <p className="font-bold text-lg text-neutral-800 mb-4">Open Ticket</p>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Select Ticket Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Select Ticket Type"
                value={ticketTypeId}
                onChange={(e) => setTicketTypeId(e.target.value)}
                error={!!error && error.includes("ticket type")}
              >
                {ticketTypes.map((item) => (
                  <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              id="outlined-basic"
              label="Your Message"
              variant="outlined"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!error && error.includes("description")}
            />
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              className={`!w-full !p-3 !bg-sky-800 hover:!bg-sky-900 !text-white !font-semibold !capitalize !text-base`}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserTicket;