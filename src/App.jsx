import React, { useState, useEffect } from "react";
import TicketSelection from "./TicketSelection";
import TicketForm from "./TicketForm";
import TicketSummary from "./TicketSummary";
import { saveToIndexedDB, getFromIndexedDB } from "./indexedDBService";

const App = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingReference, setBookingReference] = useState("");

  useEffect(() => {
    // Generate booking reference on mount
    setBookingReference(generateBookingReference());
  }, []);

  const generateBookingReference = () => {
    return 'HNG-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleSelectTicket = ({ type, count }) => {
    setSelectedTicket(type);
    setTicketCount(count);
    setCurrentStep(2);
  };

  const handleFormSubmit = async (generatedTickets) => {
    const bookingData = {
      bookingReference,
      tickets: generatedTickets,
      selectedTicket,
      ticketCount,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    };
    
    setTickets(generatedTickets);
    await saveToIndexedDB(bookingReference, bookingData);
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedTicket(null);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleNewBooking = () => {
    setSelectedTicket(null);
    setTickets([]);
    setTicketCount(1);
    setCurrentStep(1);
    setBookingReference(generateBookingReference());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center space-x-4 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${currentStep >= step 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
                }
              `}>
                {step}
              </div>
              {step < 3 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${currentStep > step ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        {currentStep === 1 && (
          <TicketSelection 
            onSelect={handleSelectTicket} 
            initialTicket={selectedTicket}
            initialCount={ticketCount}
          />
        )}
        
        {currentStep === 2 && (
          <TicketForm
            selectedTicket={selectedTicket}
            ticketCount={ticketCount}
            onSubmit={handleFormSubmit}
            onBack={handleBack}
            bookingReference={bookingReference}
          />
        )}
        
        {currentStep === 3 && (
          <TicketSummary
            tickets={tickets}
            selectedTicket={selectedTicket}
            bookingReference={bookingReference}
            onNewBooking={handleNewBooking}
          />
        )}
      </div>
    </div>
  );
};

export default App;