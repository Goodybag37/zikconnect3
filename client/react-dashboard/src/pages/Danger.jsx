import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import styles from "../style"; // Ensure this path is correct
import "../App.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logo } from "../assets"; // Corrected import
import AuthContext from "../AuthContext";

import AuthContext from "../AuthContext";
import Modal from "../components/Modal";

function VerifyPhone() {
  const [showModal, setShowModal] = useState(false);
  const [id, setId] = useState();

  const [modalContent, setModalContent] = useState("");

  const apiUrls = process.env.REACT_APP_API_URL;
  const apiUrl = "http://localhost:4000";

  const handleShowModal = () => {
    const content = (
      <>
        <div className="verifyPopup">
          <h2 className="popupHeading inline">In Danger !!</h2>
          <BsXLg
            className="text-gradient closeModal4"
            onClick={() => setShowModal(false)}
          />
        </div>
        <p className="popup-paragraph">
          By Clicking on the confirm button you consent to sending your exact
          location to zikconnect. (or UNIZIK School Authorities, and security
          agencies if you ever go missing or in danger!!)
        </p>
        <p>
          Other personal details like your phone number, full name, email and
          device location would be sent as well if demanded by required bodies
        </p>

        <Link to="/verifyphone">
          <button
            onClick={hand}
            className="bg-blue-gradient roommate-button connect-accept-button"
          >
            Confirm
          </button>
        </Link>

        <p>
          {" "}
          <i>
            {" "}
            Mostly click this if you are in danger or feel threatened. and do
            not share this secrete with non unzik students/alumni
          </i>
        </p>
      </>
    );
    setShowModal(true);

    setModalContent(content);
  };

  const handleVerifyCode = async (e) => {
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();

      console.log(userId, phone, code);

      const response = await axios.post(
        `${apiUrls}/api/verify-phone`,
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      login({
        ...userData,
        isPhoneVerified: phone || false,
      });

      // Get the redirect path from the URL parameters
      const redirectPath =
        new URLSearchParams(location.search).get("redirect") || "/agents";
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

  return (
    <div className="login-container bg-black-gradient">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo-login">
          <img src={logo} alt="Logo" className="icon_header logo" />
        </div>
        <h2 className="login-title text-gradient">Verify Number</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="input-group codeGroup">
          <input
            type="tel"
            maxLength={maxLength}
            id="phone"
            placeholder="Phone Number "
            value={phone}
            onClick={() => {
              setUsedN("");
              setSendVisible(true);
            }}
            onChange={handlePhoneChange}
            required // Added for form validation
            disabled={codeSent}
          />
          {usedN && <p className="usedNumber"> {usedN}</p>}

          {sendVisible && (
            <button
              type="button"
              onClick={() => handleSendCode()}
              className="sendCode"
              disabled={loading || codeSent || timer > 0}
            >
              {codeSent ? `Code Sent ${timer}s` : "Send Code"}
            </button>
          )}
        </div>

        <div className="input-group">
          <input
            type="number"
            maxLength={codeLength}
            id="code"
            placeholder="Enter 6 digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required // Added for form validation
          />
        </div>

        <button
          // onClick={() => handleVerifyCode()}
          className="login-button bg-blue-gradient"
          type="submit"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Verify Now"}
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

export default Danger;
