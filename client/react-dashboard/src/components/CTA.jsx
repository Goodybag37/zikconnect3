import React, { useState } from "react";
import axios from "axios";
import styles from "../style";
import Button from "./Button";
import CustomLink from "./CustomLink";
import { Link, useLocation } from "react-router-dom";

const CTA = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(""); // Add error state
  const [subscribed, setSubscribed] = useState(false); // Add error state
  const [loading, setLoading] = useState(false); // Add loading state
  const apiUrls = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Prepare the data in x-www-form-urlencoded format
      const formData = new URLSearchParams();
      formData.append("email", email);

      // Send the data
      const response = await axios.post(`${apiUrls}/api/subscribe`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const userData = response.data;
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
      setSubscribed(true);
    }
  };

  return (
    <section
      className={` ${styles.flexCenter} ${styles.marginY} ${styles.padding} 
   sm:flex-row flex-col bg-black-gradient-2 rounded-[20px] box-shadow`}
    >
      <div className="tailwind flex-1 flex flex-col">
        <h2 className={`${styles.heading2} tailwind`}>
          Subscribe to our Newsletter
        </h2>
        <p className={`${styles.paragraph}  max-w-[470px] mt-5`}>
          Get Updated on the latest news and info on new features or things
          happening around the school
        </p>
      </div>
      <div className={`${styles.flexCenter} sm:ml-10 ml-0 sm:mt-0 mt-10`}>
        <form onSubmit={handleSubmit}>
          <div className="input-group input-email ">
            {/* <BsFillPersonFill className="input-icon" /> */}
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`py-2 px-2 ml-12 bg-blue-gradient font-poppins 
    font-medium text-[18px] text-primary outline-none ${styles} rounded-[10px]`}
          >
            {loading ? "Loading" : subscribed ? "Subscribed " : "Subsribe"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CTA;
