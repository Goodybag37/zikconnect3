import { useState } from "react";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Agent from "../components/Agent";
import { Routes, Route, useParams, useLocation } from "react-router-dom";

function Agents(prop) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const userId = searchParams.get("userId");
  const userEmail = searchParams.get("email");
  const heading = "Agents";

  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  return (
    <div className="grid-container">
      <Header OpenSidebar={OpenSidebar} heading={heading} />
      <Sidebar
        openSidebarToggle={openSidebarToggle}
        OpenSidebar={OpenSidebar}
      />
      <Agent />
    </div>
  );
}

export default Agents;
