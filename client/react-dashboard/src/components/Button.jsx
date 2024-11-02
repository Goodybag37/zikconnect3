import React from "react";
import { Link } from "react-router-dom";

const Button = ({ styles }) => {
  return (
    <Link to="/register">
      <button
        type="button"
        className={`py-4 px-6 bg-blue-gradient font-poppins 
    font-medium text-[18px] text-primary outline-none ${styles} rounded-[10px]`}
      >
        Get Started
      </button>
    </Link>
  );
};

export default Button;
