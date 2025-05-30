import { useState } from "react";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Food from "../components/Food";
import { Routes, Route, useParams, useLocation } from "react-router-dom";

function Foods() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const userId = searchParams.get("userId");
  const userEmail = searchParams.get("email");

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };
  const heading = "Food";

  return (
    <div className="grid-container">
      <Header OpenSidebar={OpenSidebar} heading={heading} />
      <Sidebar
        openSidebarToggle={openSidebarToggle}
        OpenSidebar={OpenSidebar}
      />
      <Food />
    </div>
  );
}

export default Foods;
