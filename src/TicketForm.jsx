import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PropTypes from "prop-types";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas as QRCode } from "qrcode.react";

const TicketForm = ({
  selectedTicket,
  ticketCount,
  onSubmit,
  onBack,
  bookingReference,
}) => {
  const [formData, setFormData] = useState(
    Array.from({ length: ticketCount }, () => ({
      fullName: "",
      email: "",
      avatar: "",
      phone: "",
      twitter: "",
      company: "",
      jobTitle: "",
    })),
  );
  const [errors, setErrors] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [printMode, setPrintMode] = useState(false);
  const ticketRefs = useRef([]);
  const printRef = useRef(null);

  // Ticket type configurations
  const ticketConfig = {
    Standard: {
      bgGradient: "from-blue-600 to-blue-800",
      accentColor: "blue",
      textColor: "text-blue-600",
      badgeColor: "bg-blue-500",
    },
    VIP: {
      bgGradient: "from-purple-600 to-purple-900",
      accentColor: "purple",
      textColor: "text-purple-600",
      badgeColor: "bg-purple-500",
    },
    Interns: {
      bgGradient: "from-green-600 to-green-800",
      accentColor: "green",
      textColor: "text-green-600",
      badgeColor: "bg-green-500",
    },
  };

  useEffect(() => {
    setFormData((prevData) => {
      const newData = Array.from(
        { length: ticketCount },
        (_, index) =>
          prevData[index] || {
            fullName: "",
            email: "",
            avatar: "",
            phone: "",
            twitter: "",
            company: "",
            jobTitle: "",
          },
      );
      return newData;
    });
    setErrors(new Array(ticketCount).fill({}));
  }, [ticketCount]);

  const generateQRData = (index) => {
    const ticket = formData[index];
    return JSON.stringify({
      bookingRef: `${bookingReference}-${index + 1}`,
      name: ticket.fullName,
      email: ticket.email,
      type: selectedTicket,
      event: "HNG FEST 2025",
      date: "July 15, 2025",
      venue: "Eko Hotel & Suites, Lagos",
      ticketId: `TICKET-${index + 1}-${Date.now()}`,
    });
  };

  const validateField = (index, name, value) => {
    const newErrors = { ...errors[index] };

    switch (name) {
      case "fullName":
        if (!value.trim()) newErrors.fullName = "Full name is required";
        else if (value.length < 2)
          newErrors.fullName = "Name must be at least 2 characters";
        else delete newErrors.fullName;
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) newErrors.email = "Email is required";
        else if (!emailRegex.test(value))
          newErrors.email = "Please enter a valid email";
        else delete newErrors.email;
        break;

      case "phone":
        if (value && !/^[0-9+\-\s()]{10,}$/.test(value)) {
          newErrors.phone = "Please enter a valid phone number";
        } else {
          delete newErrors.phone;
        }
        break;

      default:
        break;
    }

    setErrors((prev) => {
      const updated = [...prev];
      updated[index] = newErrors;
      return updated;
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [name]: value };
      return newData;
    });
    validateField(index, name, value);
  };

  const handleImageUpload = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingIndex(index);
    const uploadPreset = "ticket_upload";
    const cloudName = "dp5z4bmqi";

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        uploadData,
      );

      const imageUrl = response.data.secure_url;
      setFormData((prevData) => {
        const newData = [...prevData];
        newData[index].avatar = imageUrl;
        return newData;
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasErrors = false;
    const newErrors = formData.map((data) => {
      const errorObj = {};
      if (!data.fullName?.trim()) {
        errorObj.fullName = "Full name is required";
        hasErrors = true;
      }
      if (!data.email?.trim()) {
        errorObj.email = "Email is required";
        hasErrors = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errorObj.email = "Please enter a valid email";
        hasErrors = true;
      }
      return errorObj;
    });

    setErrors(newErrors);

    if (!hasErrors) {
      setSubmitted(true);
      onSubmit(
        formData.map((data, idx) => ({
          ...data,
          type: selectedTicket,
          bookingReference: `${bookingReference}-${idx + 1}`,
        })),
      );
    }
  };

  const downloadTicketAsImage = async (index) => {
    try {
      const element = ticketRefs.current[index];
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
        backgroundColor: "#ffffff",
        allowTaint: true,
        useCORS: true,
        logging: false,
        windowWidth: 400,
        windowHeight: 250,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `HNG2025_${formData[index].fullName.replace(/\s+/g, "_")}_ID.png`;
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
        scale: 3,
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
        `HNG2025_${formData[index].fullName.replace(/\s+/g, "_")}_ID.pdf`,
      );
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const downloadAllTickets = async () => {
    for (let i = 0; i < formData.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await downloadTicketAsImage(i);
    }
  };

  const printTickets = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  const TicketCard = ({ data, index, isPrint = false }) => {
    const config = ticketConfig[selectedTicket] || ticketConfig.Standard;
    const qrValue = generateQRData(index);

    return (
      <div
        ref={(el) => {
          if (!isPrint) ticketRefs.current[index] = el;
        }}
        className="ticket-card relative bg-white rounded-2xl overflow-hidden shadow-2xl"
        style={{
          width: "400px",
          height: "250px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Main Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-90`}
        />

        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="400" height="250" viewBox="0 0 400 250">
            <defs>
              <pattern
                id={`grid-${index}`}
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="400" height="250" fill={`url(#grid-${index})`} />
          </svg>
        </div>

        {/* Diagonal Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 transform rotate-45 translate-x-16 -translate-y-16" />

        {/* Main Content Container */}
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="px-5 py-3 flex justify-between items-center border-b border-white/20">
            <div>
              <h3 className="text-white font-black text-xl tracking-tight">
                HNG FEST 2025
              </h3>
              <p className="text-white/80 text-[10px] font-medium">
                Official Access Pass
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
              <span className="text-white font-bold text-xs uppercase tracking-wider">
                {selectedTicket}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 flex p-4 gap-4">
            {/* Left Column - Photo & QR */}
            <div className="flex flex-col items-center gap-2">
              {/* Photo */}
              {data.avatar ? (
                <div className="relative">
                  <img
                    src={data.avatar}
                    alt={data.fullName}
                    className="w-20 h-20 rounded-xl object-cover border-3 border-white shadow-lg"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border-3 border-white flex items-center justify-center">
                  <span className="text-white text-3xl font-black">
                    {data.fullName?.charAt(0) || "?"}
                  </span>
                </div>
              )}

              {/* QR Code with improved visibility */}
              <div className="bg-white p-1.5 rounded-xl shadow-lg">
                <QRCode
                  value={qrValue}
                  size={70}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  imageSettings={{
                    src: "https://hng.tech/favicon.ico",
                    x: undefined,
                    y: undefined,
                    height: 14,
                    width: 14,
                    excavate: true,
                  }}
                />
              </div>
              <p className="text-[8px] text-white/70 font-mono tracking-wider">
                SCAN FOR VERIFICATION
              </p>
            </div>

            {/* Right Column - Details */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                {/* Name */}
                <div>
                  <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">
                    Attendee
                  </p>
                  <p className="text-white font-bold text-sm leading-tight line-clamp-2">
                    {data.fullName}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-white text-[10px] leading-tight line-clamp-1 break-all">
                    {data.email}
                  </p>
                </div>

                {/* Company/Job Title */}
                {(data.company || data.jobTitle) && (
                  <div>
                    <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">
                      Organization
                    </p>
                    <p className="text-white text-[10px] font-medium leading-tight">
                      {data.company}
                      {data.company && data.jobTitle && " • "}
                      {data.jobTitle}
                    </p>
                  </div>
                )}
              </div>

              {/* ID Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-[8px] font-mono">
                    ID: {bookingReference?.slice(-6)}-{index + 1}
                  </span>
                  <span className="text-white/70 text-[8px]">07.15.2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-2 border-t border-white/20 flex justify-between items-center text-white/60 text-[8px] font-mono">
            <span>eko hotel & suites • lagos</span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 bg-white/40 rounded-full" />
              <span>vip access only</span>
            </span>
          </div>
        </div>

        {/* Decorative Perforations */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-white rounded-r-full shadow-lg" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-white rounded-l-full shadow-lg" />
      </div>
    );
  };

  TicketCard.propTypes = {
    data: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    isPrint: PropTypes.bool,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {!submitted ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
          {ticketCount > 1 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                {formData.map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setCurrentStep(index)}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold
                      ${
                        currentStep === index
                          ? "bg-yellow-400 text-purple-900"
                          : errors[index] &&
                              Object.keys(errors[index]).length > 0
                            ? "bg-red-500 text-white"
                            : formData[index].fullName && formData[index].email
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-600"
                      }
                    `}
                  >
                    {index + 1}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Attendee Information
          </h2>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="bg-white rounded-xl p-6"
              >
                <h3 className="text-xl font-bold mb-4 text-purple-600">
                  Attendee {currentStep + 1} of {ticketCount}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData[currentStep]?.fullName || ""}
                      onChange={(e) => handleChange(currentStep, e)}
                      className={`
                        w-full p-3 border rounded-lg focus:outline-none focus:ring-2
                        ${
                          errors[currentStep]?.fullName
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-purple-200 focus:border-purple-500"
                        }
                      `}
                      placeholder="Enter full name"
                    />
                    {errors[currentStep]?.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[currentStep].fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData[currentStep]?.email || ""}
                      onChange={(e) => handleChange(currentStep, e)}
                      className={`
                        w-full p-3 border rounded-lg focus:outline-none focus:ring-2
                        ${
                          errors[currentStep]?.email
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-purple-200 focus:border-purple-500"
                        }
                      `}
                      placeholder="Enter email address"
                    />
                    {errors[currentStep]?.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[currentStep].email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData[currentStep]?.phone || ""}
                      onChange={(e) => handleChange(currentStep, e)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>

                  {/* Twitter Handle */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Twitter Handle
                    </label>
                    <input
                      type="text"
                      name="twitter"
                      value={formData[currentStep]?.twitter || ""}
                      onChange={(e) => handleChange(currentStep, e)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="@username"
                    />
                  </div>

                  {/* Company */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Company/School
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData[currentStep]?.company || ""}
                      onChange={(e) => handleChange(currentStep, e)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="Where do you work/study?"
                    />
                  </div>

                  {/* Job Title */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData[currentStep]?.jobTitle || ""}
                      onChange={(e) => handleChange(currentStep, e)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                </div>

                {/* Avatar Upload */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(currentStep, e)}
                      className="hidden"
                      id={`avatar-${currentStep}`}
                      disabled={uploadingIndex === currentStep}
                    />
                    <label
                      htmlFor={`avatar-${currentStep}`}
                      className={`
                        flex-1 p-4 border-2 border-dashed rounded-lg text-center cursor-pointer
                        transition-all duration-300
                        ${
                          formData[currentStep]?.avatar
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-purple-500 hover:bg-purple-50"
                        }
                        ${uploadingIndex === currentStep ? "opacity-50 cursor-wait" : ""}
                      `}
                    >
                      {uploadingIndex === currentStep ? (
                        <span className="text-purple-600">Uploading...</span>
                      ) : formData[currentStep]?.avatar ? (
                        <span className="text-green-600">✓ Photo uploaded</span>
                      ) : (
                        <span className="text-gray-600">
                          Click to upload photo
                        </span>
                      )}
                    </label>

                    {formData[currentStep]?.avatar && (
                      <div className="relative group">
                        <img
                          src={formData[currentStep].avatar}
                          alt="Preview"
                          className="w-16 h-16 rounded-full object-cover border-4 border-purple-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => {
                              const newData = [...prev];
                              newData[currentStep].avatar = "";
                              return newData;
                            });
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6
                                   flex items-center justify-center text-sm opacity-0 group-hover:opacity-100
                                   transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600
                         transition-colors font-medium"
                onClick={
                  ticketCount > 1 && currentStep > 0
                    ? () => setCurrentStep(currentStep - 1)
                    : onBack
                }
              >
                ← {ticketCount > 1 && currentStep > 0 ? "Previous" : "Back"}
              </motion.button>

              {ticketCount > 1 && currentStep < ticketCount - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700
                           transition-colors font-medium"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next →
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white 
                           rounded-lg hover:from-green-600 hover:to-green-700 font-medium
                           shadow-lg"
                >
                  Generate ID Cards →
                </motion.button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              🎉 ID Cards Generated Successfully!
            </h2>
            <p className="text-purple-200 mb-2">
              Booking Reference:{" "}
              <span className="font-mono bg-purple-900 px-3 py-1 rounded">
                {bookingReference}
              </span>
            </p>
            <p className="text-purple-200">
              You have successfully registered {ticketCount} attendee
              {ticketCount > 1 ? "s" : ""}
            </p>
          </div>

          {/* ID Cards Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 place-items-center">
            {formData.map((data, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <TicketCard data={data} index={index} />

                {/* Action Buttons */}
                <div className="flex justify-center gap-3 mt-4 no-print">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => downloadTicketAsImage(index)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm
                             hover:bg-purple-700 transition-colors flex items-center gap-2"
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm
                             hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bulk Actions */}
          <div className="flex justify-center gap-4 no-print">
            {ticketCount > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadAllTickets}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700
                           transition-colors font-medium flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download All PNG
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={printTickets}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700
                           transition-colors font-medium flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
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
                  Print All
                </motion.button>
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700
                       transition-colors font-medium"
            >
              Edit Information
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Hidden Print Container */}
      {printMode && (
        <div ref={printRef} className="hidden print:block">
          {formData.map((data, index) => (
            <TicketCard key={index} data={data} index={index} isPrint={true} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

TicketForm.propTypes = {
  selectedTicket: PropTypes.string.isRequired,
  ticketCount: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  bookingReference: PropTypes.string,
};

export default TicketForm;