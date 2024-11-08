import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Routes, Route, useParams, useLocation } from "react-router-dom";
import CustomLink from "./CustomLink";
import { discount, logo } from "../assets";
import { HiHome } from "react-icons/hi2";
import { TbHomePlus } from "react-icons/tb";
import { IoPeople } from "react-icons/io5";
import { FaPeoplePulling } from "react-icons/fa6";
import { FaCartPlus } from "react-icons/fa";
import { BsFillGearFill, BsBrowserEdge } from "react-icons/bs";

function Sidebar(props) {
  const [mail, setMail] = useState();
  const [id, setId] = useState();

  const { openSidebarToggle, OpenSidebar, userId, email } = props;

  useEffect(() => {
    // Update usersId when userId changes
    setId(userId);
    setMail(email);
  }, [userId]);

  return (
    <aside
      id="sidebar"
      className={openSidebarToggle ? "sidebar-responsive" : ""}
    >
      <div className="sidebar-title">
        <div className="sidebar-brand">
          <img src={logo} alt="Logo" className="icon_header logo" />
        </div>
        <span className="icon close_icon" onClick={OpenSidebar}>
          X
        </span>
      </div>

      <ul className="sidebar-list text-gradient mt-0">
        <li className="sidebar-list-item">
          <CustomLink className="card-title" to={"/"} userId={id} email={mail}>
            <HiHome className="iconSidebar bg-black-gradient" /> Home
          </CustomLink>
        </li>
        <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/agents"}
            userId={id}
            email={mail}
          >
            <IoPeople className="iconSidebar bg-black-gradient" /> Agents
          </CustomLink>
        </li>
        <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/events"}
            userId={id}
            email={mail}
          >
            <FaPeoplePulling className="iconSidebar bg-black-gradient" /> Events
          </CustomLink>
        </li>
        <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/lodges"}
            userId={id}
            email={mail}
          >
            <TbHomePlus className="iconSidebar bg-black-gradient" /> Lodges
          </CustomLink>
        </li>
        {/* <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/roommates"}
            userId={id}
            email={mail}
          >
            <BsFillHouseDoorFill className="iconSidebar bg-black-gradient"/> Roommates
          </CustomLink>
        </li> */}
        <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/buysells"}
            userId={id}
            email={mail}
          >
            <FaCartPlus className="iconSidebar bg-black-gradient" /> Buy/Sell
          </CustomLink>
        </li>
        <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/profiles"}
            userId={userId}
            email={email}
          >
            <BsBrowserEdge className="iconSidebar bg-black-gradient" /> Connects
          </CustomLink>
        </li>
        <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/settings"}
            userId={userId}
            email={email}
          >
            <BsFillGearFill className="iconSidebar bg-black-gradient" /> Profile
          </CustomLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
