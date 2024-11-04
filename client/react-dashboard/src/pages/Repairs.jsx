import { useState } from "react";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Repair from "../components/Repair";
import { Routes, Route, useParams, useLocation } from "react-router-dom";

function Repairs() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const userId = searchParams.get("userId");
  const userEmail = searchParams.get("email");
  const heading = "Repair";

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
      <Repair />
    </div>
  );
}

export default Repairs;
