import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Agents from "../pages/Agents";
import Home from "../pages/Home";
import Roommates from "../pages/Roommates";
import BuysellsPage from "../pages/Buysells";
import Courses from "../pages/Courses";
import Cryptos from "../pages/Cryptos";
import Profiles from "../pages/Profiles";
import Cybercafes from "../pages/Cybercafes";
import Deliveries from "../pages/Deliveries";
import Events from "../pages/Events";
import Riders from "../pages/Riders";
import Lodges from "../pages/Lodges";
import Schoolfees from "../pages/Schoolfees";
import Whatsapptvs from "../pages/Whatsapptvs";
import Login from "../pages/Login";
import Register from "../pages/register";
import BecomeAgent from "../pages/BecomeAgent";
import VerifyPhone from "../pages/VerifyPhone";
import VerifyId from "../pages/VerifyId";
import ProtectedRoutes from "./ProtectedRoutes";
import UploadProperty from "../pages/UploadProperty";
function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  // const location = useLocation();
  // const searchParams = new URLSearchParams(location.search);

  // const [usersId, setUsersId] = useState();
  // const [email, setEmail] = useState();
  // const userId = searchParams.get("userId");
  // const userEmail = searchParams.get("email");

  // useEffect(() => {
  //   setUsersId(userId);
  //   setEmail(userEmail);
  // }, [userId, userEmail]);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  return (
    <Routes>
      {/* Default route to Login */}

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Agents />} />
        <Route
          element={
            <ProtectedRoutes
              conditions={["phone", "id"]}
              redirectPaths={{ phone: "/verifyphone", id: "/verifyid" }}
            />
          }
        >
          <Route path="/becomeagent" element={<BecomeAgent />} />
        </Route>

        <Route
          element={
            <ProtectedRoutes
              conditions={["phone", "id"]}
              redirectPaths={{ phone: "/verifyphone", id: "/verifyid" }}
            />
          }
        >
          <Route path="/uploadproperty" element={<UploadProperty />} />
        </Route>

        <Route path="/agents" element={<Agents />} />
        <Route path="/verifyphone" element={<VerifyPhone />} />
        <Route path="/verifyid" element={<VerifyId />} />

        <Route path="/home" element={<Home />} />
        <Route path="/buysells" element={<BuysellsPage />} />
        <Route path="/roommates" element={<Roommates />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/cryptos" element={<Cryptos />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/cybercafes" element={<Cybercafes />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/events" element={<Events />} />
        <Route path="/riders" element={<Riders />} />
        <Route path="/lodges" element={<Lodges />} />
        <Route path="/schoolfees" element={<Schoolfees />} />
        <Route path="/whatsapptvs" element={<Whatsapptvs />} />
      </Route>
    </Routes>
  );
}

export default App;
