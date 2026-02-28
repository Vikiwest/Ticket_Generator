import React, { useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

const TicketSelection = ({ onSelect, initialTicket, initialCount }) => {
  const [selectedTicket, setSelectedTicket] = useState(initialTicket || null);
  const [ticketCount, setTicketCount] = useState(initialCount || 1);
  const [hoveredTicket, setHoveredTicket] = useState(null);

  const tickets = [
    { 
      type: "Standard", 
      price: "$50", 
      description: "General admission ticket.",
      benefits: ["Access to all main events", "Conference materials", "Networking access"],
      color: "from-blue-500 to-blue-600",
      icon: "🎫"
    },
    { 
      type: "VIP", 
      price: "$100", 
      description: "Access to VIP lounge & front-row seating.",
      benefits: ["All Standard benefits", "VIP lounge access", "Front row seating", "Meet & greet session"],
      color: "from-purple-500 to-purple-600",
      icon: "⭐"
    },
    { 
      type: "Interns", 
      price: "$10", 
      description: "Discounted ticket for Interns (ID required).",
      benefits: ["All Standard benefits", "Mentorship session", "Student networking"],
      color: "from-green-500 to-green-600",
      icon: "🎓"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header Section */}
      <motion.div 
        className="text-center mb-12"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold text-white mb-4">HNG FEST 2025</h1>
        <p className="text-xl text-purple-200 mb-6">Africa's Biggest Tech Festival</p>
        <div className="inline-block bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3">
          <p className="text-white flex items-center gap-2">
            <span>📅</span> July 15, 2025 | <span>📍</span> Eko Hotel & Suites, Victoria Island, Lagos
          </p>
        </div>
      </motion.div>

      {/* Ticket Selection Section */}
      <h2 className="text-3xl font-bold text-center text-white mb-8">Select Your Ticket Type</h2>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tickets.map((ticket) => (
          <motion.div
            key={ticket.type}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoveredTicket(ticket.type)}
            onHoverEnd={() => setHoveredTicket(null)}
            className={`
              relative cursor-pointer rounded-2xl overflow-hidden
              transform transition-all duration-300
              ${selectedTicket === ticket.type 
                ? 'ring-4 ring-yellow-400 shadow-2xl' 
                : 'shadow-lg hover:shadow-xl'
              }
            `}
            onClick={() => setSelectedTicket(ticket.type)}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${ticket.color} opacity-90`} />
            
            {/* Content */}
            <div className="relative p-6 text-white">
              <div className="text-4xl mb-4">{ticket.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{ticket.type}</h3>
              <div className="text-3xl font-bold mb-4">{ticket.price}</div>
              <p className="text-white/90 mb-4">{ticket.description}</p>
              
              {/* Benefits */}
              <AnimatePresence>
                {hoveredTicket === ticket.type && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 text-sm"
                  >
                    {ticket.benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <span>✓</span> {benefit}
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>

              {/* Selected Indicator */}
              {selectedTicket === ticket.type && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1"
                >
                  <svg className="w-4 h-4 text-purple-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Ticket Count Selection */}
      <motion.div 
        className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <label className="block text-white text-lg mb-4 text-center">
          Number of Tickets
        </label>
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-purple-600 text-white text-2xl font-bold
                     hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
            disabled={ticketCount <= 1}
          >
            -
          </motion.button>
          
          <input
            type="number"
            min="1"
            max="10"
            value={ticketCount}
            onChange={(e) => setTicketCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20 h-12 text-center text-xl font-bold rounded-lg border-2 border-purple-400
                     focus:border-yellow-400 focus:outline-none"
          />
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-purple-600 text-white text-2xl font-bold
                     hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
            disabled={ticketCount >= 10}
          >
            +
          </motion.button>
        </div>

        {/* Continue Button */}
        <AnimatePresence>
          {selectedTicket && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white 
                       py-3 px-6 rounded-lg font-bold text-lg shadow-lg
                       hover:from-green-600 hover:to-green-700 transition-all"
              onClick={() => onSelect({ type: selectedTicket, count: ticketCount })}
            >
              Continue to Registration → 
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

TicketSelection.propTypes = {
  onSelect: PropTypes.func.isRequired,
  initialTicket: PropTypes.string,
  initialCount: PropTypes.number,
};

export default TicketSelection;