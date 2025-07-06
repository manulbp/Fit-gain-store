import React from "react";
import { createContext, useState, useEffect } from "react";

export const StoreContext = createContext();

const StoreContextProvider = ({ children }) => {
  const serverURL = "http://localhost:4000";
  const [ticketTypes, setTicketTypes] = useState([]);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        const response = await fetch(`${serverURL}/api/ticket/types`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (data.success) {
          setTicketTypes(data.data);
        } else {
          console.error("Failed to load ticket types:", data.message);
        }
      } catch (error) {
        console.error("Error fetching ticket types:", error.message);
      }
    };

    fetchTicketTypes();
  }, [serverURL]);

  const contextValue = {
    serverURL,
    ticketTypes,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;