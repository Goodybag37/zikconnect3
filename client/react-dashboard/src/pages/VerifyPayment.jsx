import React, { useEffect, useState, useContext } from "react";

import axios from "axios";
import Modal from "../components/Modal";
import AuthContext from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { logo } from "../assets"; // Corrected import

const VerifyPayment = () => {
  const [status, setStatus] = useState("Verifying...");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const navigate = useNavigate();
  const apiUrls = process.env.REACT_APP_API_URL;
  const { isAuthenticated, setUser, login, logout } = useContext(AuthContext);

  useEffect(() => {
    // Extract the payment reference from the query params in the URL
    const query = new URLSearchParams(location.search);
    const reference = query.get("reference");

    if (reference) {
      // Call the backend to verify the payment
      axios
        .get(`${apiUrls}/api/paystack/verify/${reference}`)
        .then((response) => {
          if (response.data.success) {
            const verifiedAmount = response.data.amount / 100;
            setStatus("Payment verified successfully.");
          } else {
            setStatus("Payment verification failed.");
          }
        })
        .catch((error) => {
          console.error("Error verifying payment:", error);
          setStatus("Payment verification failed.");
        });
    } else {
      setStatus("No payment reference found.");
    }
  }, [location.search]);

  return (
    <div className="login-container bg-black-gradient">
      <div className="login-form">
        <div className="logo-login">
          <img src={logo} alt="Logo" className="icon_header logo" />
        </div>
        <h2 className="login-title text-gradient">{status}</h2>

        <Link to="/agents">
          <button className="login-button bg-blue-gradient" type="submit">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
};

export default VerifyPayment;
