import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import styles from "../style";
import "../App.css";
import Modal from "../components/Modal";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logo } from "../assets"; // Corrected import
import AuthContext from "../AuthContext";
import UserContext from "../UserContext";
import { BsFillPersonFill, BsLockFill } from "react-icons/bs";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [fullname, setFullname] = useState("");
  const [error, setError] = useState(""); // Add error state
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrls = process.env.REACT_APP_API_URL;
  const apiUrl = "http://localhost:4000";
  const [cantBeChanged, setCantBeChanged] = useState(false);
  const { isAuthenticated, user, login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const { setProfile } = useContext(UserContext);
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
    if (password) {
      // Ensure password is not undefined or null
      validatePassword(password);
    }
  }, [password]); // Add password to dependency array

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validatePassword(password)) {
      setError("Password must meet all requirements");
      setLoading(false);

      return;
    }

    try {
      // Prepare the data in x-www-form-urlencoded format
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("fullname", fullname);

      // Send the data
      const response = await axios.post(`${apiUrls}/api/register`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const userData = response.data;

      console.log("Registration successful:", userData);

      localStorage.setItem("authToken", response.data.token); // Assuming the token is in response.data.token
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isAuthenticated", true);

      // Get the redirect path from the URL parameters

      login({
        ...userData,
        id: userData.id,
        full_name: userData.full_name,
        email: userData.email,
        account_balance: userData.account_balance,
        isPhoneVerified: userData.phone || false,
        isIdVerified: userData.isIdVerified || true,
        isEmailVerified: userData.isEmailVerified,
      });

      const redirectPath = "/agents";

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    console.log("AuthContext Updated:", { isAuthenticated, user });
  }, [isAuthenticated, user]);

  return (
    <div className="login-container bg-black-gradient">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo-login">
          <img src={logo} alt="Logo" className="icon_header logo" />
        </div>
        {/* <h2 className="login-title text-gradient">Register</h2> */}
        {error && <p className="error-message">{error}</p>}{" "}
        {/* Display error if exists */}
        <div className="input-group input-email ">
          {/* <BsFillPersonFill className="input-icon" /> */}
          <input
            type="text"
            id="email"
            placeholder="Full Name - (FirstN LastN)"
            value={fullname}
            onClick={() => setCantBeChanged(true)}
            onChange={(e) => setFullname(e.target.value)}
          />
        </div>
        {cantBeChanged && <p className="cantBeChanged">Can not be changed</p>}
        <div className="input-group input-email ">
          {/* <BsFillPersonFill className="input-icon" /> */}
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onClick={() => setCantBeChanged(false)}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group password-container">
          {/* <BsLockFill className="input-icon" /> */}
          <input
            type={showPassword ? "text" : "password"}
            id="email"
            placeholder="Password"
            value={password}
            onClick={() => {
              setShowRequirements(true);
              setCantBeChanged(false);
            }}
            onChange={(e) => setPassword(e.target.value)}
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
        )}
        <button
          className="login-button bg-blue-gradient"
          type="submit"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <p>
          Already have an account?{" "}
          <Link className="signup-link text-gradient " to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
