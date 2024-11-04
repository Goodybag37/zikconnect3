import React from "react";
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import styles from "../style"; // Ensure this path is correct
import "../App.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logo } from "../assets"; // Corrected import
import AuthContext from "../AuthContext";

function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sendVisible, setSendVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, login, logout } = useContext(AuthContext);
  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId; // Optional chaining to avoid errors if user is null

  const emailbread =
    user?.email || JSON.parse(localStorage.getItem("user"))?.email;
  const isPhoneVerified = user.isPhoneVerified;

  const userData = JSON.parse(localStorage.getItem("user"));
  const maxLength = 250;
  const codeLength = 6;
  const apiUrls = process.env.REACT_APP_API_URL;
  const apiUrl = "http://localhost:4000";

  const isCodeValid = code.length > 0 && code.length === 6; // Example: Only enable if the code is 6 characters long

  <button
    onClick={() => handleVerifyCode()}
    className="login-button bg-blue-gradient"
    type="submit"
    disabled={loading || !isCodeValid}
  >
    {loading ? "Submitting..." : "Verify Now"}
  </button>;

  const resendDelay = 60; // Delay in seconds before allowing to resend code

  // Function to start the timer for resending code
  const startTimer = () => {
    setTimer(resendDelay);
    console.log("Timer started with", resendDelay, "seconds");
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(intervalId);
          setCodeSent(false);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    try {
      // Create a new instance of URLSearchParams to encode the phone number and user ID
      const formData = new URLSearchParams();
      formData.append("emailbread", emailbread);
      formData.append("user", userbread);

      //   // Send a GET request to chzaeck if the phone number has already been used
      //   const used = await axios.get(`${apiUrls}/api/get-used-number`, {
      //     params: { phoneUsed: phone }, // Pass the phone number as a query parameter
      //   });

      //   const usedNumber = used.data.length;

      //   if (usedNumber > 0) {
      //     setUsedN("Number has already been used.");
      //     setSendVisible(false);
      //     return;
      //   } else {
      setCodeSent(true);
      startTimer();
      setError("");
      setLoading(true);
      //   }

      const response = await axios.post(
        `${apiUrls}/api/send-verification-email`,
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      console.log("Code sent, starting timer...");
      // Start the resend timer
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

  const signout = () => {
    logout();
  };

  const handleVerifyCode = async (e) => {
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("emailbread", emailbread);
      formData.append("code", code);
      formData.append("user", userbread);

      const response = await axios.post(
        `${apiUrls}/api/verify-email`,
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      login({
        ...userData,
        isEmailVerified: true,
      });

      console.log();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // console.log(`Submitting email: ${email}`); // Debugging line
    // console.log(`Submitting password: ${password}`); // Debugging line

    try {
      // Prepare the data in x-www-form-urlencoded format

      formData.append("emailbread", emailbread);
      formData.append("code", code);

      // Send the data
      const response = await axios.post(
        `${apiUrls}/api/verify-email`,
        formData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      console.log("you have been added as a user", response.data);

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

  return (
    <div className="login-container bg-black-gradient">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo-login">
          <img src={logo} alt="Logo" className="icon_header logo" />
        </div>
        <h2 className="login-title text-gradient">Verify Email</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="input-group codeGroup">
          <input
            type="email"
            maxLength={maxLength}
            id="email"
            value={emailbread}
            onClick={() => {
              setSendVisible(true);
            }}
            required // Added for form validation
            disabled={codeSent}
          />

          <button
            type="button"
            onClick={() => handleSendCode()}
            className="sendCode"
            disabled={loading || codeSent || timer > 0}
          >
            {codeSent ? `Code Sent ${timer}s` : "Send Code"}
          </button>
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
          onClick={() => handleVerifyCode()}
          className="login-button bg-blue-gradient"
          type="submit"
          disabled={loading || !isCodeValid}
        >
          {loading ? "Submitting..." : "Verify Now"}
        </button>
        <button
          onClick={() => {
            signout();
          }}
          className="signoutButton profileParagraph text-gradient"
        >
          {" "}
          SIGN OUT
        </button>
      </form>
    </div>
  );
}

export default VerifyEmail;
