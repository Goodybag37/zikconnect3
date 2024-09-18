import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import styles from "../style"; // Ensure this path is correct
import "../App.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logo } from "../assets"; // Corrected import

function BecomeAgent() {
  const [type, setType] = useState("");
  const [located, setLocated] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [call, setCall] = useState("");
  const [error, setError] = useState("");
  const [reviewTypeSelection, setReviewTypeSelection] = useState({});
  const [reviewType, setReviewType] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAgent, setSelectedAgent] = useState("");

  const maxLength = 250;

  const handleSelectChange = (event) => {
    setSelectedAgent(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // console.log(`Submitting email: ${email}`); // Debugging line
    // console.log(`Submitting password: ${password}`); // Debugging line

    try {
      // Prepare the data in x-www-form-urlencoded format
      const formData = new URLSearchParams();
      formData.append("type", type);
      formData.append("located", located);
      formData.append("description", description);
      formData.append("call", call);
      formData.append("whatsapp", whatsapp);

      // Send the data
      const response = await axios.post(
        "http://localhost:4000/become-agent",
        formData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      console.log("you have been added as agent", response.data);

      // Get the redirect path from the URL parameters
      const redirectPath =
        new URLSearchParams(location.search).get("redirect") || "/agents";

      // Navigate to the original destination or a default page
      navigate(redirectPath);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReviewTypeChange = (agentId, type) => {
    setReviewType((prev) => ({
      ...prev,
      [agentId]: type,
    }));
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo-login">
          <img src={logo} alt="Logo" className="icon_header logo" />
        </div>
        <h2 className="login-title">Become Agent</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="input-group input-email">
          <select
            className="input-select "
            id="agent-select"
            value={selectedAgent}
            onChange={handleSelectChange}
            required
          >
            <option value="">--Please choose an option--</option>
            <option value="cryptoagents">Crypto Agent</option>
            <option value="courseagents">Course Agent</option>
            <option value="cybercafeagents">Cybercafe Agent</option>
            <option value="deliveryagents">Delivery Agent</option>
            <option value="rideragents">Rider Agent</option>
            <option value="schoolfeeagents">Schoolfees Agent</option>
            <option value="whatsapptvagents">Whatsapp Tv Agent</option>
          </select>
        </div>

        <div className="input-group input-email">
          <input
            maxLength={maxLength}
            type="text" // Changed to 'email' for validation
            id="located"
            placeholder="location around Unizik"
            value={located}
            onChange={(e) => setLocated(e.target.value)}
            required // Added for form validation
          />
        </div>

        <div className="input-group">
          <input
            type="tel"
            maxLength={maxLength}
            id="number"
            placeholder="Call Number "
            value={call}
            onChange={(e) => setCall(e.target.value)}
            required // Added for form validation
          />
        </div>

        <div className="input-group">
          <input
            maxLength={maxLength}
            type="tel"
            id="description"
            placeholder="Whatsapp Number"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required // Added for form validation
          />
        </div>
        <div className="input-group">
          <textarea
            className="textarea-description"
            maxLength={maxLength}
            placeholder="Describe your business and list your prices to target only serious customers"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default BecomeAgent;
