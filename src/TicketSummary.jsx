import React, { useRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeCanvas as QRCode } from "qrcode.react";

const TicketSummary = ({
  tickets,
  selectedTicket,
  bookingReference,
  onNewBooking,
}) => {
  const totalAmount =
    tickets.length *
    (selectedTicket === "VIP" ? 100 : selectedTicket === "Interns" ? 10 : 50);

  const ticketRefs = useRef([]);

  const generateQRData = (ticket, index) => {
    return JSON.stringify({
      bookingRef: `${bookingReference}-${index + 1}`,
      name: ticket.fullName,
      email: ticket.email,
      type: selectedTicket,
      event: "HNG FEST 2025",
      date: "July 15, 2025",
      venue: "Eko Hotel & Suites, Lagos",
    });
  };

  const downloadTicketAsImage = async (index) => {
    try {
      const element = ticketRefs.current[index];
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        allowTaint: true,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `HNG2025_${tickets[index].fullName.replace(/\s+/g, "_")}_ID.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading ticket:", error);
      alert("Failed to download ticket. Please try again.");
    }
  };

  const downloadTicketAsPDF = async (index) => {
    try {
      const element = ticketRefs.current[index];
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        allowTaint: true,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [88, 54],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 88, 54);
      pdf.save(
        `HNG2025_${tickets[index].fullName.replace(/\s+/g, "_")}_ID.pdf`,
      );
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const TicketCard = ({ ticket, index }) => (
    <div
      ref={(el) => (ticketRefs.current[index] = el)}
      className="ticket-card relative bg-white rounded-xl overflow-hidden shadow-xl"
      style={{
        width: "400px",
        height: "250px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Background Pattern - Using inline styles with hex colors */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 250">
            <pattern
              id={`pattern-${index}`}
              patternUnits="userSpaceOnUse"
              width="40"
              height="40"
            >
              <path
                d="M0 40L40 0M40 40L0 0"
                stroke="#6B46C1"
                strokeWidth="1"
                fill="none"
              />
            </pattern>
            <rect width="400" height="250" fill={`url(#pattern-${index})`} />
          </svg>
        </div>
      </div>

      {/* Ticket Header - Using hex colors for html2canvas compatibility */}
      <div
        className="relative h-16 flex items-center px-4"
        style={{
          background: "linear-gradient(90deg, #9333ea 0%, #4f46e5 100%)",
        }}
      >
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">HNG FEST 2025</h3>
          <p style={{ color: "#e9d5ff" }} className="text-xs">
            Africa's Biggest Tech Festival
          </p>
        </div>
        <div
          className="rounded-lg px-3 py-1"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <span className="text-white font-bold text-sm">{selectedTicket}</span>
        </div>
      </div>

      {/* Ticket Content */}
      <div className="relative p-4 flex gap-4">
        {/* Left Section - Photo */}
        <div className="flex-shrink-0">
          {ticket.avatar ? (
            <img
              src={ticket.avatar}
              alt={ticket.fullName}
              className="w-24 h-24 rounded-lg object-cover border-4"
              style={{ borderColor: "#c4b5fd" }}
              crossOrigin="anonymous"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-lg flex items-center justify-center text-white text-4xl font-bold border-4"
              style={{
                background: "linear-gradient(135deg, #a78bfa 0%, #9333ea 100%)",
                borderColor: "#c4b5fd",
              }}
            >
              {ticket.fullName?.charAt(0) || "?"}
            </div>
          )}

          {/* QR Code */}
          <div className="mt-2 bg-white p-1 rounded-lg">
            <QRCode
              value={generateQRData(ticket, index)}
              size={60}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        {/* Right Section - Details */}
        <div className="flex-1">
          <div className="mb-2">
            <p className="text-xs" style={{ color: "#6b7280" }}>
              Name
            </p>
            <p className="font-bold text-sm line-clamp-1">{ticket.fullName}</p>
          </div>
          <div className="mb-2">
            <p className="text-xs" style={{ color: "#6b7280" }}>
              Email
            </p>
            <p className="text-xs line-clamp-1">{ticket.email}</p>
          </div>
          {ticket.company && (
            <div className="mb-2">
              <p className="text-xs" style={{ color: "#6b7280" }}>
                Company/School
              </p>
              <p className="text-xs line-clamp-1">{ticket.company}</p>
            </div>
          )}
          {ticket.jobTitle && (
            <div className="mb-2">
              <p className="text-xs" style={{ color: "#6b7280" }}>
                Job Title
              </p>
              <p className="text-xs line-clamp-1">{ticket.jobTitle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Footer */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-between px-4 text-xs"
        style={{
          backgroundColor: "#f9fafb",
          borderTop: "1px dashed #d1d5db",
          color: "#6b7280",
        }}
      >
        <span>
          #{bookingReference}-{index + 1}
        </span>
        <span>Eko Hotel & Suites • July 15, 2025</span>
      </div>

      {/* Decorative Elements */}
      <div
        className="absolute top-1/2 left-0 w-4 h-8 bg-white rounded-r-full shadow-md"
        style={{ transform: "translateY(-50%)" }}
      ></div>
      <div
        className="absolute top-1/2 right-0 w-4 h-8 bg-white rounded-l-full shadow-md"
        style={{ transform: "translateY(-50%)" }}
      ></div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Booking Confirmation */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-green-500 rounded-full p-3 mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-purple-200">
            Your tickets have been successfully booked
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
            <span className="text-gray-600">Booking Reference</span>
            <span className="font-mono font-bold text-purple-600">
              {bookingReference}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Ticket Type</span>
              <span className="font-semibold">{selectedTicket}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of Tickets</span>
              <span className="font-semibold">{tickets.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold text-green-600">
                ${totalAmount}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold mb-2">Ticket Holders:</h3>
            <ul className="space-y-2">
              {tickets.map((ticket, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {index + 1}. {ticket.fullName} - {ticket.email}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ID Cards Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          🎫 Your ID Cards
        </h2>
        <p className="text-purple-200 text-center mb-6">
          Download or print your ID cards with QR codes for event entry
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 place-items-center">
          {tickets.map((ticket, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <TicketCard ticket={ticket} index={index} />

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => downloadTicketAsImage(index)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  PNG
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => downloadTicketAsPDF(index)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  PDF
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.print()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewBooking}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Book More Tickets
        </motion.button>
      </div>
    </motion.div>
  );
};

TicketSummary.propTypes = {
  tickets: PropTypes.array.isRequired,
  selectedTicket: PropTypes.string.isRequired,
  bookingReference: PropTypes.string.isRequired,
  onNewBooking: PropTypes.func.isRequired,
};

export default TicketSummary;
