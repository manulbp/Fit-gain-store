import React from "react";
import { Button, Modal, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import { UserContext } from "../../context/UserContext";

const AdminTicket = () => {
  const { serverURL } = useContext(StoreContext);
  const { User, authToken } = useContext(UserContext);
  const [openReplyModal, setOpenReplyModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [filterTicket, setFilterTicket] = useState("Pending");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!User?.admin) return;
      try {
        setActionLoading(true);
        const response = await fetch(`${serverURL}/api/ticket/all?status=${filterTicket}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch tickets");
        if (data.success) setTickets(data.data);
        setFetchError("");
      } catch (err) {
        setFetchError(err.message || "Failed to load tickets");
      } finally {
        setActionLoading(false);
      }
    };
    fetchTickets();
  }, [User, authToken, serverURL, filterTicket]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      setActionLoading(true);
      let endpoint = "";
      let body = { ticketId };
      
      if (newStatus === "In Progress") {
        endpoint = "start-progress";
      } else if (newStatus === "Resolved") {
        if (!reply && newStatus === "Resolved") {
          setError("Please enter a reply before resolving.");
          return;
        }
        endpoint = "resolve";
        body.reply = reply;
      } else if (newStatus === "Closed") {
        endpoint = "close";
        body.userId = User._id;
      }

      const response = await fetch(`${serverURL}/api/ticket/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update ticket status");
      
      if (data.success) {
        setTickets(tickets.map(t => t._id === ticketId ? data.data : t));
        if (newStatus === "Resolved" || newStatus === "Closed") {
          setOpenReplyModal(false);
          setReply("");
        }
      }
    } catch (err) {
      setError(err.message || "Failed to update ticket status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setOpenReplyModal(true);
  };

  const handleStatusSelect = async (e, ticket) => {
    const newStatus = e.target.value;
    if (newStatus === "Resolved") {
      setSelectedTicket(ticket);
      setOpenReplyModal(true);
    } else {
      await handleStatusChange(ticket._id, newStatus);
    }
  };

  const handleReplySubmit = async () => {
    if (!reply) {
      setError("Please enter a reply.");
      return;
    }
    await handleStatusChange(selectedTicket._id, "Resolved");
  };

  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "Pending":
        return ["In Progress"];
      case "In Progress":
        return ["Resolved", "Closed"];
      case "Resolved":
        return ["Closed"];
      default:
        return [];
    }
  };

  return (
    <>
      <div className="w-full h-full p-4">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <h1 className="font-bold text-xl text-neutral-800">All Tickets</h1>
            <FormControl size="small" className="!min-w-[200px]">
              <InputLabel>Filter Status</InputLabel>
              <Select
                value={filterTicket}
                onChange={(e) => setFilterTicket(e.target.value)}
                label="Filter Status"
              >
                {["Pending", "In Progress", "Resolved", "Closed"].map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          
          <div className="w-full h-[calc(100vh-180px)] overflow-y-auto">
            {actionLoading && <p className="text-neutral-600">Loading tickets...</p>}
            {fetchError && <p className="text-red-500 text-sm">{fetchError}</p>}
            
            {!actionLoading && tickets.length === 0 && !fetchError ? (
              <p className="text-neutral-600">No {filterTicket.toLowerCase()} tickets found.</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket, index) => (
                  <div 
                    key={ticket._id} 
                    className="w-full p-4 bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-neutral-700">#{index + 1}</span>
                          <span className="px-2 py-1 text-xs font-semibold rounded capitalize"
                            style={{
                              backgroundColor: 
                                ticket.status === "Pending" ? "#FEF3C7" :
                                ticket.status === "In Progress" ? "#E0F2FE" :
                                ticket.status === "Resolved" ? "#D1FAE5" : "#FEE2E2",
                              color: 
                                ticket.status === "Pending" ? "#92400E" :
                                ticket.status === "In Progress" ? "#0369A1" :
                                ticket.status === "Resolved" ? "#065F46" : "#B91C1C"
                            }}
                          >
                            {ticket.status}
                          </span>
                          <span className="text-sm font-medium text-neutral-600">
                            {ticket.ticketTypeId?.name || "Unknown Type"}
                          </span>
                        </div>
                        <p className="text-neutral-800 font-medium mb-2">{ticket.description}</p>
                        {ticket.reply && (
                          <div className="mt-2 p-3 bg-neutral-50 rounded">
                            <p className="text-sm font-medium text-neutral-600">Admin Reply:</p>
                            <p className="text-neutral-800">{ticket.reply}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-3">
                      <FormControl size="small" className="!min-w-[120px]">
                        <Select
                          value={ticket.status}
                          onChange={(e) => handleStatusSelect(e, ticket)}
                          disabled={actionLoading}
                          displayEmpty
                        >
                          <MenuItem value={ticket.status} disabled>
                            <em>Change Status</em>
                          </MenuItem>
                          {getAvailableStatuses(ticket.status).map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        size="small"
                        disabled={actionLoading}
                        onClick={() => handleTicketClick(ticket)}
                        className="!capitalize !text-xs"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={openReplyModal}
        onClose={() => !loading && setOpenReplyModal(false)}
        aria-labelledby="reply-modal-title"
      >
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Ticket Details</h2>
          
          {selectedTicket && (
            <>
              <div className="mb-4">
                <p className="text-sm text-neutral-600">Status: 
                  <span className="ml-2 px-2 py-1 text-xs font-semibold rounded capitalize"
                    style={{
                      backgroundColor: 
                        selectedTicket.status === "Pending" ? "#FEF3C7" :
                        selectedTicket.status === "In Progress" ? "#E0F2FE" :
                        selectedTicket.status === "Resolved" ? "#D1FAE5" : "#FEE2E2",
                      color: 
                        selectedTicket.status === "Pending" ? "#92400E" :
                        selectedTicket.status === "In Progress" ? "#0369A1" :
                        selectedTicket.status === "Resolved" ? "#065F46" : "#B91C1C"
                    }}
                  >
                    {selectedTicket.status}
                  </span>
                </p>
                <p className="text-sm text-neutral-600">Type: {selectedTicket.ticketTypeId?.name || "Unknown"}</p>
              </div>
              
              <div className="mb-4">
                <p className="font-medium mb-1">Description:</p>
                <p className="bg-neutral-50 p-3 rounded">{selectedTicket.description}</p>
              </div>
              
              {(selectedTicket.status === "In Progress" || selectedTicket.status === "Pending") && (
                <div className="mb-4">
                  <TextField
                    label="Your Reply"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    error={!!error}
                    helperText={error}
                  />
                </div>
              )}
              
              {selectedTicket.reply && (
                <div className="mb-4">
                  <p className="font-medium mb-1">Previous Reply:</p>
                  <p className="bg-neutral-50 p-3 rounded">{selectedTicket.reply}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outlined"
                  onClick={() => setOpenReplyModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                
                {(selectedTicket.status === "In Progress" || selectedTicket.status === "Pending") && (
                  <Button
                    variant="contained"
                    onClick={handleReplySubmit}
                    disabled={loading || !reply}
                  >
                    {loading ? "Processing..." : "Resolve Ticket"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AdminTicket;