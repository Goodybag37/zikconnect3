import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Routes, Route, useParams, useLocation } from "react-router-dom";
import CustomLink from "./CustomLink";
import { discount, logo } from "../assets";

import {
  BsFillCollectionFill,
  BsFillPeopleFill,
  BsFillHouseDoorFill,
  BsFillPersonLinesFill,
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsFillGearFill,
} from "react-icons/bs";

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
            <BsFillPersonLinesFill className="icon" /> Home
          </CustomLink>
        </li>
        <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/agents"}
            userId={id}
            email={mail}
          >
            <BsFillPersonLinesFill className="icon" /> Agents
          </CustomLink>
        </li>
        <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/events"}
            userId={id}
            email={mail}
          >
            <BsFillPeopleFill className="icon" /> Events
          </CustomLink>
        </li>
        <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/lodges"}
            userId={id}
            email={mail}
          >
            <BsFillHouseDoorFill className="icon" /> Lodges
          </CustomLink>
        </li>
        {/* <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/roommates"}
            userId={id}
            email={mail}
          >
            <BsFillHouseDoorFill className="icon" /> Roommates
          </CustomLink>
        </li> */}
        <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/buysells"}
            userId={id}
            email={mail}
          >
            <BsFillCollectionFill className="icon" /> Buy/Sell
          </CustomLink>
        </li>
        <li className="sidebar-list-item">
          <CustomLink
            className="card-title"
            to={"/profiles"}
            userId={userId}
            email={email}
          >
            <BsFillGearFill className="icon" /> Profile
          </CustomLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
