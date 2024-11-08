import React from "react";
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import styles from "../style"; // Ensure this path is correct
import "../App.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logo } from "../assets"; // Corrected import
import AuthContext from "../AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setnewPassword] = useState("");

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
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
  const [showRequirements, setShowRequirements] = useState(false);
  const [isValid, setIsValid] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    digit: false,
  });

  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;

    setIsValid({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      digit: /\d/.test(password),
    });
    return passwordRegex.test(password);
  };

  React.useEffect(() => {
    if (newPassword) {
      // Ensure password is not undefined or null
      validatePassword(newPassword);
    }
  }, [newPassword]); // Add password to dependency array

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validatePassword(newPassword)) {
      setError("Password must meet all requirements");
      setLoading(false);

      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("oldPassword", oldPassword);
      formData.append("newPassword", newPassword);
      formData.append("email", emailbread);

      const response = await axios.post(
        `${apiUrls}/api/change-password`,
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      // Get the redirect path from the URL parameters
      //   const redirectPath = new URLSearchParams(location.search).get("/agents");
      navigate("/agents");
    } catch (error) {
      // Check if error.response exists
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
      <form className="login-form" onSubmit={handleChangePassword}>
        <div className="logo-login">
          <img src={logo} alt="Logo" className="icon_header logo" />
        </div>
        {/* <h2 className="login-title text-gradient">Change Password</h2> */}
        {error && <p className="error-message">{error}</p>}
        <div className="input-group codeGroup password-container">
          <input
            type={showPassword ? "text" : "password"}
            maxLength={maxLength}
            id="email"
            placeholder="Current Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required // Added for form validation
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="password-toggle-button"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div className="input-group password-container">
          <input
            type={showPassword ? "text" : "password"}
            maxLength={maxLength}
            id="code"
            placeholder="New Password"
            value={newPassword}
            onClick={() => {
              setShowRequirements(true);
            }}
            onChange={(e) => setnewPassword(e.target.value)}
            required // Added for form validation
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="password-toggle-button"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {showRequirements && (
          <ul className="passWordRegex">
            <li className={isValid.length ? "valid" : ""}>
              At least 8 characters long
            </li>
            <li className={isValid.lowercase ? "valid" : ""}>
              At least one lowercase letter
            </li>
            <li className={isValid.uppercase ? "valid" : ""}>
              At least one uppercase letter
            </li>
            <li className={isValid.digit ? "valid" : ""}>At least one digit</li>
          </ul>
        )}{" "}
        <button
          className="login-button bg-blue-gradient"
          type="submit"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
