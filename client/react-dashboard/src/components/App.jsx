import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Agents from "../pages/Agents";
import Home from "../pages/Home";
import Roommates from "../pages/Roommates";
import BuysellsPage from "../pages/Buysells";
import Markets from "../pages/Markets3";

import Foods from "../pages/Foods";
import Repairs from "../pages/Repairs";
import Profiles from "../pages/Profiles";
import Cybercafes from "../pages/Cybercafes";
import Deliveries from "../pages/Deliveries";
import EventsPage from "../pages/Events";
import Fundings from "../pages/Fundings";
import Riders from "../pages/Riders";
import Lodges from "../pages/Lodges";
import Schoolfees from "../pages/Schoolfees";
import Whatsapptvs from "../pages/Whatsapptvs";
import Login from "../pages/Login";
import Register from "../pages/register";
import BecomeAgent from "../pages/BecomeAgent";
import VerifyPhone from "../pages/VerifyPhone";
import VerifyEmail from "../pages/VerifyEmail";
import VerifyId from "../pages/VerifyId";
import ProtectedRoutes from "./ProtectedRoutes";
import UploadProperty from "../pages/UploadProperty";
import UploadBrand from "../pages/UploadBrand";
import UploadLodge from "../pages/UploadLodge";
import UploadEvent from "../pages/UploadEvent";
import FundAccount from "../pages/FundAccount";
import VerifyPayment from "../pages/VerifyPayment";
import ChangePassword from "../pages/ChangePassword";
import AgentManagement from "../pages/AgentManagement";
import WithdrawFunds from "../pages/WithdrawFunds";
import Settings from "../pages/Settings";
import FaceCapture from "./FaceCapture";
import ThankYou from "./ThankYou";

function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  return (
    <Routes>
      {/* Default route to Login */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoutes
          // conditions={["email"]}
          // redirectPaths={{
          //   email: "/verifyemail",
          // }}
          />
        }
      >
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
          <Route path="/uploadlodge" element={<UploadLodge />} />
          <Route path="/uploadproperty" element={<UploadProperty />} />
          <Route path="/uploadevent" element={<UploadEvent />} />
          <Route path="/uploadbrand" element={<UploadBrand />} />
          <Route path="/changepassword" element={<ChangePassword />} />
          <Route path="/capture-face" element={<FaceCapture />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Route>

        <Route path="/verifyphone" element={<VerifyPhone />} />
        <Route path="/verifyemail" element={<VerifyEmail />} />
        <Route path="/verifyid" element={<VerifyId />} />
        <Route
          element={
            <ProtectedRoutes
              conditions={["email"]}
              redirectPaths={{ email: "/verifyemail" }}
            />
          }
        >
          <Route path="/agents" element={<Agents />} />
          <Route path="/agentmanagement" element={<AgentManagement />} />
          <Route path="/fundaccount" element={<FundAccount />} />
          <Route path="/verifypayment" element={<VerifyPayment />} />
          <Route path="/withdrawfunds" element={<WithdrawFunds />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/buysells" element={<BuysellsPage />} />
          <Route path="/fundings" element={<Fundings />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/roommates" element={<Roommates />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/repairs" element={<Repairs />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/cybercafes" element={<Cybercafes />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/riders" element={<Riders />} />
          <Route path="/lodges" element={<Lodges />} />
          <Route path="/schoolfees" element={<Schoolfees />} />
          <Route path="/whatsapptvs" element={<Whatsapptvs />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
