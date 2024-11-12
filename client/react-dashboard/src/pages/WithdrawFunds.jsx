import React from "react";
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import styles from "../style"; // Ensure this path is correct
import "../App.css";
import AuthContext from "../AuthContext";
import Modal from "../components/Modal";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logo } from "../assets"; // Corrected import
import { BsXLg, BsCashCoin } from "react-icons/bs";

function WithdrawFunds() {
  const [bankName, setBankname] = useState("");
  const [accountNumber, setAccountnumber] = useState("");
  const [accountName, setAccountname] = useState("");
  const [amount, setAmount] = useState("");
  const { isAuthenticated, user, login } = useContext(AuthContext);
  const apiUrl = "http://localhost:4000";
  const apiUrls = process.env.REACT_APP_API_URL;

  const userPhone =
    user?.isPhoneVerified ||
    JSON.parse(localStorage.getItem("user"))?.isPhoneVerified; // Optional chaining to avoid errors if user is null

  const fullName =
    user?.full_name || JSON.parse(localStorage.getItem("user"))?.full_name;
  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId; // Optional chaining to avoid errors if user is null

  const emailbread =
    user?.email || JSON.parse(localStorage.getItem("user"))?.email;

  const [whatsapp, setWhatsapp] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const maxLength = 250;

  const handlePhoneChange = (e) => {
    let input = e.target.value;
    setWhatsapp(input);
  };

  const handleFocus = (e) => {
    // Set the value to start with '+234 0' only when the input is focused for the first time
    const input = e.target.value;

    // Prevent the user from removing the prefix
    if (!input.startsWith("+234 0")) {
      setWhatsapp("+234 0");
    } else {
      setWhatsapp(input); // Update only if the prefix is intact
    }
  };
  const handleSelectChange = (event) => {
    setSelectedAgent(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Prepare the data in x-www-form-urlencoded format
      const formData = new URLSearchParams();
      formData.append("bankName", bankName);
      formData.append("accountName", accountName);
      formData.append("accountNumber", accountNumber);
      formData.append("amount", amount);
      formData.append("email", emailbread);
      formData.append("user", userbread);
      formData.append("fullName", fullName);
      formData.append("call", userPhone);
      formData.append("whatsapp", whatsapp);

      setModalContent(
        <div>
          <h1 className="text-gradient"> Pending !! </h1>
          <p>
            {" "}
            Dear {fullName}. Your withdrawal request has been recieved. You will
            be credited within 24-72 hours depending on the processing time by
            our finance team. You will be notified via email upon confirmation
          </p>
          <button
            style={{
              marginTop: "20px",
              background: "#ff0000",
              color: "#fff",
              border: "none",
              padding: "10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowModal(false);
              redirect();
            }} // Close the modal when clicked
          >
            Close
          </button>
        </div>
      );
      setShowModal(true);
      const redirect = () => {
        // Get the redirect path from the URL parameters
        const redirectPath =
          new URLSearchParams(location.search).get("redirect") || "/agents";

        // Navigate to the original destination or a default page
        navigate(redirectPath);
      };
      const response = await axios.post(
        `${apiUrls}/api/withdraw-funds`,
        formData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
        setShowModal(false);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo-login">
          <img src={logo} alt="Logo" className="icon_header logo" />
        </div>
        <h2 className="login-title text-gradient  becomeAgent">
          {" "}
          Withdraw Funds{" "}
        </h2>
        {error && <p className="error-message">{error}</p>}

        <br></br>

        <div className="input-group input-email">
          <input
            maxLength={maxLength}
            type="text" // Changed to 'email' for validation
            id="bankname"
            placeholder="Bank Name"
            value={bankName}
            onChange={(e) => setBankname(e.target.value)}
            required // Added for form validation
            className="bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="input-group input-email">
          <input
            maxLength={maxLength}
            type="text" // Changed to 'email' for validation
            id="accountname"
            placeholder="Account Name"
            value={accountName}
            onChange={(e) => setAccountname(e.target.value)}
            required // Added for form validation
          />
        </div>

        <div className="input-group">
          <input
            type="number"
            maxLength={maxLength}
            id="number"
            placeholder="Account Number "
            value={accountNumber}
            onChange={(e) => setAccountnumber(e.target.value)}
            // onChange={(e) => setCall(e.target.value)}
            required // Added for form validation
            className="bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="input-group">
          <input
            maxLength={15} // Adjust the max length as needed
            type="number"
            id="Amount"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required // Added for form validation
          />
        </div>

        <div className="input-group">
          <input
            maxLength={16} // Adjust the max length as needed
            type="text"
            id="description"
            placeholder="Whatsapp Number (10-digit)"
            value={whatsapp}
            onChange={handlePhoneChange}
            onFocus={handleFocus} // Triggered when the input is clicked
            required // Added for form validation
          />
        </div>

        <button className="login-button bg-blue-gradient" type="submit">
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);

          localStorage.removeItem("showModal");
        }}
        content={modalContent}
      />
    </div>
  );
}

export default WithdrawFunds;
