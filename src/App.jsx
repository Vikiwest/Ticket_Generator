import React, { useState } from "react";
import TicketSelection from "./TicketSelection";
import TicketForm from "./TicketForm";

const App = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [tickets, setTickets] = useState([]);

  const handleSelectTicket = ({ type, count }) => {
    setSelectedTicket(type);
    setTicketCount(count);
  };

  const handleFormSubmit = (generatedTickets) => {
    setTickets(generatedTickets);
  };

  const handleBack = () => {
    setSelectedTicket(null);
    setTickets([]); // Reset tickets when going back
  };

  return (
    <div>
      {!selectedTicket ? (
        <TicketSelection onSelect={handleSelectTicket} />
      ) : (
        <TicketForm
          selectedTicket={selectedTicket}
          ticketCount={ticketCount}
          onSubmit={handleFormSubmit}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default App;
