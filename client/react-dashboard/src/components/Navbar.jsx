import React from "react";
import { useState, useContext } from "react";
import { close, logo, menu } from "../assets";
import { navLinks } from "../constants";
import { Link, useLocation } from "react-router-dom";
import { BsPersonCircle } from "react-icons/bs";
import AuthContext from "../AuthContext";
const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [toggle, setToggle] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId;
  const isSignedIn =
    user?.isAuthenticated ||
    JSON.parse(localStorage.getItem("user"))?.isAuthenticated;

  const handleProfileClick = () => {
    if (isSignedIn === true) setShowProfile(!showProfile);
  };

  return (
    <div>
      <nav className=" w-full flex py-6 justify-between items-center navbar">
        <img src={logo} alt="zikconnect" className="w-[124px] h-[100px]" />

        <ul className="list-none z-[5] text-gradient sm:flex hidden justify-end items-center flex-1">
          {navLinks.map((nav, index) => (
            <li
              key={nav.id}
              className={`font-poppins font-normal cursor-pointer  
        text-[16px] ${
          index === navLinks.length - 1 ? "mr-20" : "mr-10"
        } text-white`}
            >
              <Link className="text-white no-decoration" to={`/${nav.id}`}>
                {nav.title}
              </Link>
            </li>
          ))}

          {/* <BsPersonCircle
            // onClick={handleProfileClick}
            className="icon iconCursor"
          /> */}
        </ul>

        <div className="sm:hidden flex flex-1 justify-end items-center">
          <img
            src={toggle ? close : menu}
            alt="menu"
            className="w-[28px] h-[28px] object-contain"
            onClick={() => setToggle((prev) => !prev)}
          />

          <div
            className={`${
              toggle ? "flex" : "hidden"
            } p-6 bg-black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar`}
          >
            <ul className="list-none flex flex-col justify-end items-center flex-1">
              {navLinks.map((nav, index) => (
                <li
                  key={nav.id}
                  className={`font-poppins list-none font-normal cursor-pointer  
        text-[16px] ${
          index === navLinks.length - 1 ? "mr-0" : "mb-4"
        } text-white`}
                >
                  <Link className="text-white no-decoration" to={`/${nav.id}`}>
                    {nav.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
