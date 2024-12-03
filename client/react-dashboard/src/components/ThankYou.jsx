import React, { useEffect, useState, useContext } from "react";

import axios from "axios";
import Modal from "../components/Modal";
import AuthContext from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { logo } from "../assets"; // Corrected import

const ThankYou = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const navigate = useNavigate();
  const apiUrls = process.env.REACT_APP_API_URL;
  const { isAuthenticated, setUser, login, logout } = useContext(AuthContext);

  return (
    <div className="login-container bg-black-gradient">
      <div className="login-form">
        <h2 className="login-title text-gradient">Pending Approval</h2>
        <p>
          Your request has been recieved. You might be interviewed by one of our
          customer agent if we need further security details from you. You will
          recieve a response within 24 hours.
        </p>

        <Link to="/agents">
          <button className="login-button bg-blue-gradient" type="submit">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ThankYou;
