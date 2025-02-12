import  { useState } from "react";
import PropTypes from "prop-types";

const TicketSelection = ({ onSelect }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);

  const tickets = [
    { type: "Standard", price: "$50", description: "General admission ticket." },
    { type: "VIP", price: "$100", description: "Access to VIP lounge & front-row seating." },
    { type: "Interns", price: "$10", description: "Discounted ticket for Interns (ID required)." },
  ];

  return (
    <div className="bg-purple-900 min-h-screen px-4 sm:px-8 md:px-16 pt-10">
    <div className="flex flex-col items-center justify-center min-h-[95vh] rounded-lg bg-purple-950 p-6">
      
      {/* Header Section */}
      <div className="flex flex-col items-center text-center bg-black p-6 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-white">HNG FEST 2025</h1>
        <p className="text-base sm:text-lg mb-3 text-white">Get your tickets now!</p>
        <p className="text-sm sm:text-lg mb-3 text-white">Eko Hotel And Suites | July 15, 2025</p>
        <p className="text-sm sm:text-lg mb-3 text-white">📍 Address: 1415 Adetokunbo Ademola Street, Victoria Island, Lagos</p>
      </div>
  
      {/* Ticket Selection Section */}
      <h2 className="text-xl sm:text-2xl font-bold mt-6 mb-4 text-center">Select Your Ticket</h2>
      <div className="grid gap-3 w-[50%] sm:grid-cols-2 lg:grid-cols-3 place-items-cente">
        {tickets.map((ticket) => (
          <button
            key={ticket.type}
            className={`border p-4 rounded-lg shadow-md w-full max-w-[250px] text-center transition-all duration-200 
              ${selectedTicket === ticket.type ? "bg-blue-500 text-white" : "bg-white"}`}
            onClick={() => setSelectedTicket(ticket.type)}
          >
            <h3 className="text-lg font-semibold">{ticket.type}</h3>
            <p className="text-gray-600">{ticket.price}</p>
            <p className="text-sm mt-2">{ticket.description}</p>
          </button>
        ))}
      </div>
  
      {/* Ticket Count Selection */}
      <div className="mt-6 flex flex-col items-center w-full">
        <label className="block text-white mb-2">Number of Tickets:</label>
        <select
          value={ticketCount}
          onChange={(e) => setTicketCount(Number(e.target.value))}
          className="border p-2 rounded-lg w-full max-w-[200px] text-center"
        >
          {[...Array(10).keys()].map((num) => (
            <option key={num + 1} value={num + 1}>
              {num + 1}
            </option>
          ))}
        </select>
      </div>
  
      {/* Continue Button */}
      {selectedTicket && ticketCount > 0 && (
        <button
          className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          onClick={() => onSelect({ type: selectedTicket, count: ticketCount })}
        >
          Continue to Form
        </button>
      )}
    </div>
  </div>
  
  );
};

TicketSelection.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default TicketSelection;

     