// import { useState } from 'react'
// import '../App.css'
// import Header from '../components/Header'
// import Sidebar from '../components/Sidebar'
// import Profile from '../components/Profile'

// function Profiles() {
//   const [openSidebarToggle, setOpenSidebarToggle] = useState(false)

//   const OpenSidebar = () => {
//     setOpenSidebarToggle(!openSidebarToggle)
//   }

//   return (
//     <div className='grid-container'>
//       <Header OpenSidebar={OpenSidebar}/>
//       <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
//       <Profile />
//     </div>
//   )
// }

// export default Profiles

// ProfilePage.js
import { useState } from "react";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Lodge from "../components/Lodge";
import Profile from "../components/Profile";
import { Routes, Route, useParams, useLocation } from "react-router-dom";

function Profiles() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const userId = searchParams.get("userId");
  const userEmail = searchParams.get("email");

  const heading = "Profile";

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

      <Profile />
    </div>
  );
}

export default Profiles;
