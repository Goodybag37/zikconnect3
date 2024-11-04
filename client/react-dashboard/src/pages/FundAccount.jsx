import React from "react";
import axios from "axios";

import { useEffect, useState, useContext } from "react";
import styles from "../style"; // Ensure this path is correct
import "../App.css";

import { PaystackPop } from "@paystack/inline-js";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logo } from "../assets"; // Corrected import
import AuthContext from "../AuthContext";
import { BsXLg, BsCashCoin } from "react-icons/bs";
import Modal from "../components/Modal";

function FundAccount() {
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, login, logout } = useContext(AuthContext);
  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId; // Optional chaining to avoid errors if user is null

  const email = user?.email || JSON.parse(localStorage.getItem("user"))?.email;
  const isPhoneVerified = user.isPhoneVerified;

  const userData = JSON.parse(localStorage.getItem("user"));
  const maxLength = 250;
  const [loading, setLoading] = useState(false);
  const codeLength = 6;
  const apiUrls = process.env.REACT_APP_API_URL;
  const apiUrl = "http://localhost:4000";
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");

  useEffect(() => {
    const fetchPendingPayment = async () => {
      // Define an inner async function
      try {
        const result = await axios.get(
          `${apiUrls}/api/get-pending-payment?email=${email}`
        ); // Await the result
        const response = result.data;

        if (response.length > 0) {
          const content = (
            <>
              <div className="verifyPopup">
                <h2 className="popupHeading inline">Pending Payment</h2>
                <Link to="/agents">
                  <BsXLg
                    className="text-gradient closeModal4"
                    onClick={() => setShowModal(false)}
                  />
                </Link>
              </div>
              <p className="popup-paragraph">
                You have a pending payment which has not been approved, we
                suggest you wait for approval before initiating a second payment
                or click on proceed if you want a double payment in case the
                initial payment becomes successful. A follow-up email would be
                sent to you.
              </p>

              <button
                onClick={() => setShowModal(false)}
                className="bg-blue-gradient roommate-button connect-accept-button"
              >
                <BsCashCoin className="cashIcon" />
                Proceed
              </button>
            </>
          );

          setShowModal(true);
          setModalContent(content);
        }
      } catch (error) {
        console.error("Error fetching pending payments:", error);
        // Optionally, you could also show an error modal or message here
      }
    };

    fetchPendingPayment(); // Call the inner function
  }, []); // Dependency array

  const handlePayment = async () => {
    setLoading(true);
    event.preventDefault();
    try {
      // const formData = new URLSearchParams();
      // formData.email("email", email);
      // formData.append("amount", amount);

      console.log("email is ", email);
      // Initialize the transaction by calling your backend
      const response = await axios.post(
        "http://localhost:4000/paystack/initialize",
        {
          email,
          amount,
        }
      );

      const { authorization_url } = response.data;
      if (authorization_url) {
        // Redirect to Paystack Payment Page
        window.location.href = authorization_url;
      }
    } catch (error) {
      console.error("Error initializing payment", error);
    }
  };

  return (
    <div className="login-container bg-black-gradient">
      <form className="login-form" onSubmit={handlePayment}>
        <div className="logo-login">
          <img src={logo} alt="Logo" className="icon_header logo" />
        </div>
        <h2 className="login-title text-gradient">Fund Account</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="input-group codeGroup">
          <input
            type="hidden"
            maxLength={maxLength}
            id="email"
            value={email}
            required // Added for form validation
          />
        </div>

        <div className="input-group inputGroupFund">
          <input
            type="number"
            id="amount"
            placeholder="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required // Added for form validation
          />
        </div>

        <button className="login-button bg-blue-gradient" type="submit">
          {loading ? "Loading..." : "PAY NOW"}
        </button>

        <Link to="/agents">
          <button className="signoutButton profileParagraph text-gradient">
            {" "}
            CANCEL
          </button>
        </Link>
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

export default FundAccount;
