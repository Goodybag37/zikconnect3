import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../AuthContext";
import { Link } from "react-router-dom";
import {
  BsFillPersonFill,
  BsBriefcaseFill,
  BsFillTelephoneFill,
  BsEyedropper,
  BsFillPlusSquareFill,
  BsFillPersonXFill,
} from "react-icons/bs";
import { FaRegCopy } from "react-icons/fa";
import { BiMoneyWithdraw } from "react-icons/bi";

function Setting() {
  const { isAuthenticated, user, login, signout } = useContext(AuthContext);
  const [profile, setProfile] = useState([]);

  const [copied, setCopied] = useState(false);
  const textToCopy = profile.settings_referral_code; // Text to be copied

  // Ensure user is defined before accessing user.userId
  const userbread = user ? user.userId : null;

  const apiUrls = process.env.REACT_APP_API_URL;

  const apiUrl = "http://localhost:4000"; // Use env variable or fallback

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  const fetchData = async () => {
    try {
      if (userbread) {
        const response = await axios.get(
          `${apiUrls}/api/profile?userbread=${userbread}`
        );
        const profiles = response.data;
        console.log("profile is ", profiles);
        setProfile(profiles);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Only fetch data if userbread exists
    if (userbread) {
      fetchData();
    }
  }, [userbread]); // Use userbread as a dependency

  if (!user) {
    return <div>Loading...</div>; // Handle the case where user is not yet loaded
  }

  return (
    <main className="mainContainer  ">
      <div className="mainTitleSetting settingTitle">
        <div className="cardSetting">
          <div className="card-inners">
            <div className="font-small mt-[8rem]">
              <h4 className="text-gradient"> Full Name: {user.full_name}</h4>
              <hr className="profileRule"></hr>
              <p className="text-gradient">
                <strong>User ID: {user.id} </strong>
                {/* <BsFillPersonFill /> */}
              </p>
              <hr className="profileRule"></hr>
              <p className="text-gradient">
                <strong>
                  Referral Code: {profile.settings_referral_code}{" "}
                </strong>

                <FaRegCopy onClick={handleCopy} style={{ cursor: "pointer" }} />
                {copied == true ? <p className="copyCode">copied</p> : ""}
                {/* <BsFillPersonFill /> */}
              </p>
              <hr className="profileRule"></hr>
              <p className="text-gradient">
                {/* <BsBriefcaseFill /> */}
                <strong>Email: {user.email} </strong>
              </p>
              <hr className="profileRule"></hr>
              <p>
                {/* <BsFillTelephoneFill /> */}
                <strong>
                  Total Referral: {profile.settings_total_referral || 0}{" "}
                </strong>
              </p>
              <hr className="profileRule"></hr>
              <p>
                {/* <BsFillTelephoneFill /> */}
                <strong>
                  Referred Agents: {profile.settings_referred_agents || 0}{" "}
                </strong>
              </p>
              <hr className="profileRule"></hr>

              <p>
                {/* <BsFillTelephoneFill /> */}
                <strong className="text-gradient">
                  Withdrawable Cash: {profile.settings_withdrawable_cash || 0}{" "}
                  <Link
                    className="editPhone ml-[5px] mt-[7px]"
                    to="/withdrawfunds"
                  >
                    <BiMoneyWithdraw />
                  </Link>
                </strong>
              </p>
              <hr className="profileRule"></hr>
              <p>
                {/* <BsFillTelephoneFill /> */}
                <strong>Change Password- </strong>
                <Link className="editPhone" to="/changepassword">
                  <BsEyedropper />
                </Link>
              </p>
              <hr className="profileRule"></hr>

              <p>
                {/* <BsFillTelephoneFill /> */}
                <strong>
                  Account Balance: {profile.settings_account_balance}{" "}
                </strong>
                <Link className="fundAccount" to="/fundaccount">
                  <BsFillPlusSquareFill />
                </Link>
              </p>
              <hr className="profileRule"></hr>
              <p className="text-gradient">
                {/* <BsFillTelephoneFill /> */}
                <strong>Account Created: {profile.account_created} </strong>
              </p>

              <hr className="profileRule"></hr>
              <p className="text-gradient">
                {/* <BsFillTelephoneFill /> */}
                <strong>
                  Connect Made: {profile.settings_total_connectmade}{" "}
                </strong>
              </p>
              <hr className="profileRule"></hr>
              <p className="text-gradient">
                {/* <BsFillTelephoneFill /> */}
                <strong>
                  Connect Recieved: {profile.settings_total_connectreceived}{" "}
                </strong>
              </p>
              <hr className="profileRule"></hr>
              <p className="text-gradient">
                {/* <BsFillTelephoneFill /> */}
                <strong>
                  Completed Orders: {profile.settings_completed_orders}{" "}
                </strong>
              </p>
              <hr className="profileRule"></hr>
              <p className="text-gradient">
                {/* <BsFillTelephoneFill /> */}
                <strong>
                  Pecentage Completed Orders: {profile.settings_average_orders}%{" "}
                </strong>
              </p>
              <hr className="profileRule"></hr>
            </div>
          </div>
        </div>

        <div className="cardSetting2">
          <div className="card-inners">
            <div className="font-small"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Setting;
