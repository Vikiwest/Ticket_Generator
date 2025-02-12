import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import PropTypes from "prop-types";
import axios from "axios"; // For making HTTP requests to Cloudinary



const saveToStorage = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));
const getFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];

const TicketForm = ({ selectedTicket, ticketCount, onSubmit, onBack }) => {
  const [formData, setFormData] = useState(
    () =>
      getFromStorage("ticketForm") ||
      Array.from({ length: ticketCount }, () => ({
        fullName: "",
        email: "",
        avatar: "",
      }))
  );
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ticketRefs = useRef([]);

  useEffect(() => {
    saveToStorage("ticketForm", formData);
  }, [formData]);

  useEffect(() => {
    setFormData((prevData) => {
      const newData = Array.from(
        { length: ticketCount },
        (_, index) => prevData[index] || { fullName: "", email: "", avatar: "" }
      );
      return newData;
    });
  }, [ticketCount]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [name]: value };
      return newData;
    });
  };

  const handleImageUpload = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const uploadPreset = "ticket_upload";
    const cloudName = "dp5z4bmqi";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      const imageUrl = response.data.secure_url;
      setFormData((prevData) => {
        const newData = [...prevData];
        newData[index].avatar = imageUrl;
        return newData;
      });
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      setError("Failed to upload image. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (formData.some(({ fullName, email }) => !fullName || !email)) {
      setError("Full Name and Email are required.");
      return;
    }
    if (
      formData.some(({ email }) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      setError("Please enter a valid email.");
      return;
    }
    setSubmitted(true);
    onSubmit(formData.map((data) => ({ ...data, type: selectedTicket })));
  };

  const downloadTicketAsImage = (index) => {
    html2canvas(ticketRefs.current[index], { useCORS: true }).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `ticket_${index + 1}.png`;
      link.click();
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-900 p-6">
    {!submitted ? (
      <div className="animate-fadeIn w-full max-w-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white text-center">
          Fill in Your Details
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form
          className="bg-white p-6 rounded-lg shadow-md w-full"
          onSubmit={handleSubmit}
        >
          {formData.map((data, index) => (
            <div key={index} className="mb-6">
              <h3 className="font-bold text-lg mb-2">Ticket {index + 1}</h3>
  
              <label className="block mb-2">Full Name:</label>
              <input
                type="text"
                name="fullName"
                value={data.fullName}
                onChange={(e) => handleChange(index, e)}
                className="border p-2 w-full rounded-lg"
                required
              />
  
              <label className="block mt-4 mb-2">Email Address:</label>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={(e) => handleChange(index, e)}
                className="border p-2 w-full rounded-lg"
                required
              />
  
              <label className="block mt-4 mb-2">
                Avatar Image URL :
              </label>
              <input
                type="text"
                name="avatar"
                value={data.avatar}
                onChange={(e) => handleChange(index, e)}
                className="border p-2 w-full rounded-lg"
                placeholder="Paste image URL here"
              />
  
              <label className="block mt-4 mb-2">Or Upload Avatar (Optional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e)}
                className="border p-2 w-full rounded-lg"
              />
  
              {data.avatar && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={data.avatar}
                    alt="Avatar Preview"
                    className="w-24 h-24 rounded-full border-4 border-blue-300"
                  />
                </div>
              )}
            </div>
          ))}
          
          <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
            <button
              type="button"
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 w-full sm:w-auto"
              onClick={onBack}
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 w-full sm:w-auto"
            >
              Generate {ticketCount} Ticket(s)
            </button>
          </div>
        </form>
      </div>
    ) : (
      <div className="animate-fadeIn w-full max-w-4xl text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">
          Your Conference Tickets
        </h2>
        <p className="text-lg text-white mb-6">You have {ticketCount} ticket(s).</p>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 place-items-center">
          {formData.map((data, index) => (
            <div
              key={index}
              ref={(el) => (ticketRefs.current[index] = el)}
              className="bg-white p-6 rounded-lg shadow-lg w-72 max-w-full text-center border-2 border-gray-300"
            >
              {data.avatar && (
                <img
                  src={data.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-300"
                  crossOrigin="anonymous"
                />
              )}
              <h3 className="text-lg font-semibold">{data.fullName}</h3>
              <p className="text-gray-600">{data.email}</p>
              <p className="text-blue-500 font-semibold">{selectedTicket} Ticket</p>
              <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full sm:w-auto"
                onClick={() => downloadTicketAsImage(index)}
              >
                Download as Image
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
  
  );
};


TicketForm.propTypes = {
  selectedTicket: PropTypes.string.isRequired,
  ticketCount: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};


export default TicketForm;
