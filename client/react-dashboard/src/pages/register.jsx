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

  const { isAuthenticated, user, login } = useContext(AuthContext);
  const { setProfile } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log(`Submitting email: ${email}`); // Debugging line
    console.log(`Submitting password: ${password}`); // Debugging line

    try {
      // Prepare the data in x-www-form-urlencoded format
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("fullname", fullname);

      // Send the data
      const response = await axios.post(`${apiUrl}/api/register`, formData, {
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
            placeholder="Full name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />
        </div>
        <div className="input-group input-email ">
          {/* <BsFillPersonFill className="input-icon" /> */}
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          {/* <BsLockFill className="input-icon" /> */}
          <input
            type="password"
            id="email"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
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
