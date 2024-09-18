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
import React, { useContext } from "react";
import AuthContext from "../AuthContext"; // Import the context

const ProfilePage = () => {
  const { user, isAuthenticated } = useContext(AuthContext); // Access user and isAuthenticated

  if (!isAuthenticated) {
    return <p>Please log in to view this page.</p>;
  }

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      <p>User ID: {user.id}</p>
    </div>
  );
};

export default ProfilePage;
