import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import styles from "../style";
import "../App.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logo } from "../assets";
import AuthContext from "../AuthContext";
import UserContext from "../UserContext";
import { BsFillPersonFill, BsLockFill } from "react-icons/bs";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, login } = useContext(AuthContext);
  const { setProfile } = useContext(UserContext);
  // const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";
  const apiUrl = "http://localhost:4000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log(`Submitting email: ${email}`);
    console.log(`Submitting password: ${password}`);

    try {
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const response = await axios.post(`${apiUrl}/api/log`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const userData = response.data;

      // localStorage.setItem("authToken", response.data.token);

      // Store user data in local storage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isAuthenticated", true);

      // Update the context state or any other state management
      // setUser(userData);
      // isAuthenticated(true);

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

      // setUser({
      //   id: response.data.userId,
      //   email: response.data.email,
      //   // Add any other user info you get from the server
      // });

      // setProfile({
      //   user: response.data.userId,
      //   isPhoneVerified: response.data.isPhoneVerified, // Assuming this data is returned from the server
      //   isIDVerified: response.data.isIDVerified, // Assuming this data is returned from the server
      // });

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

  const handleGoogleLogin = () => {
    // Redirect to the Google login route provided by the server
    window.location.href = `${apiUrl}/api/auth/google`;

    const redirectPath =
      new URLSearchParams(location.search).get("redirect") || "/agents";
  };

  return (
    <div className="login-container bg-black-gradient ">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo-login">
          <img src={logo} alt="Logo" className="icon_header logo" />
        </div>
        {/* <h2 className="login-title text-gradient">Login</h2> */}
        {error && <p className="error-message">{error}</p>}
        <div className="input-group input-email ">
          {/* <BsFillPersonFill className="input-icon" /> */}
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          {/* <BsLockFill className="input-icon" /> */}
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          className="login-button bg-blue-gradient"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* <h1 className="or-text">OR</h1>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="google-login-button"
        >
          Login with Google
        </button> */}

        <p>
          Don’t have an account?{" "}
          <Link className="signup-link text-gradient" to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
