import { useState } from "react";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Worker from "../components/Worker";
import { Routes, Route, useParams, useLocation } from "react-router-dom";
import { BsZoomIn } from "react-icons/bs";
function Workers(props) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const userId = searchParams.get("userId");
  const userEmail = searchParams.get("email");

  console.log(userId);

  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const heading = "Workers";

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
      <Worker />
    </div>
  );
}

export default Workers;
