import React from "react";
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import styles from "../style"; // Ensure this path is correct
import "../App.css";
import AuthContext from "../AuthContext";
import Modal from "../components/Modal";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logo } from "../assets"; // Corrected import
import { BsXLg, BsCashCoin } from "react-icons/bs";

function BecomeAgent() {
  const [type, setType] = useState("");
  const [located, setLocated] = useState("");
  const { isAuthenticated, user, login } = useContext(AuthContext);
  const apiUrl = "http://localhost:4000";
  const apiUrls = process.env.REACT_APP_API_URL;

  const userPhone =
    user?.isPhoneVerified ||
    JSON.parse(localStorage.getItem("user"))?.isPhoneVerified; // Optional chaining to avoid errors if user is null

  const fullName =
    user?.full_name || JSON.parse(localStorage.getItem("user"))?.full_name;
  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId; // Optional chaining to avoid errors if user is null

  const emailbread =
    user?.email || JSON.parse(localStorage.getItem("user"))?.email;

  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [call, setCall] = useState("");
  const [error, setError] = useState("");
  const [reviewTypeSelection, setReviewTypeSelection] = useState({});
  const [reviewType, setReviewType] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAgent, setSelectedAgent] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [permission, setPermission] = useState(null);
  const [locationM, setLocationM] = useState({
    latitude: null,
    longitude: null,
    error: null,
  });

  const maxLength = 250;
  const maxLengthN = 16;
  const maxLengthL = 30;

  const handlePhoneChange = (e) => {
    let input = e.target.value;
    setWhatsapp(input);
  };

  const handleFocus = (e) => {
    // Set the value to start with '+234 0' only when the input is focused for the first time
    const input = e.target.value;

    // Prevent the user from removing the prefix
    if (!input.startsWith("+234 0")) {
      setWhatsapp("+234 0");
    } else {
      setWhatsapp(input); // Update only if the prefix is intact
    }
  };
  const handleSelectChange = (event) => {
    setSelectedAgent(event.target.value);
  };

  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         setPermission("granted");
  //         setLocationM({
  //           latitude: position.coords.latitude,
  //           longitude: position.coords.longitude,
  //           error: null,
  //         });
  //       },
  //        (error) => {
  //         if (error.code === 1) {
  //           // Permission denied
  //           setPermission("denied");

  //           await axios.post(`${apiUrls}/denied-location`, {
  //             type: "becomeaAgent",
  //             user_id: userbread,
  //           })

  //         } else {
  //           setPermission("error");
  //         }
  //         setLocationM({
  //           latitude: null,
  //           longitude: null,
  //           error: error.message,
  //         });
  //       }
  //     );
  //   } else {
  //     setPermission("unsupported");
  //     setLocationM({
  //       latitude: null,
  //       longitude: null,
  //       error: "Geolocation is not supported by this browser.",
  //     });
  //   }
  // }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermission("granted");
          setLocationM({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
          });
        },
        (error) => {
          const handleError = async () => {
            if (error.code === 1) {
              // Permission denied
              setPermission("denied");
              try {
                await axios.post(`${apiUrls}/api/denied-location`, {
                  type: "becomeaAgent",
                  user_id: userbread,
                });
              } catch (err) {
                console.error("Failed to post denied location:", err);
              }
            } else {
              setPermission("error");
            }
            setLocationM({
              latitude: null,
              longitude: null,
              error: error.message,
            });
          };

          handleError();
        }
      );
    } else {
      setPermission("unsupported");
      setLocationM({
        latitude: null,
        longitude: null,
        error: "Geolocation is not supported by this browser.",
      });
    }
  }, [userbread]); // Add `userbread` if it changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check account balance
      const balanceResponse = await axios.get(
        `${apiUrls}/api/get-account-balance?userId=${userbread}`
      );
      const accountBalance = balanceResponse.data.account_balance;

      if (accountBalance == null) {
        console.error("Error: account_balance is undefined.");
        setError("Unable to retrieve account balance. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Account balance is", accountBalance);
      if (accountBalance < 300) {
        const content5 = (
          <>
            <div className="verifyPopup">
              <h2 className="popupHeading inline">Low Balance</h2>
              <BsXLg
                className="text-gradient closeModal4"
                onClick={() => setShowModal(false)}
              />
            </div>
            <p className="popup-paragraph">
              You need at least 300 naira to become an agent. Please fund your
              account and try again.
            </p>
            <Link to="/fundaccount">
              <button className="bg-blue-gradient roommate-button connect-accept-button">
                <BsCashCoin className="cashIcon" />
                Fund Account
              </button>
            </Link>
          </>
        );

        setShowModal(true);
        setModalContent(content5);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error fetching account balance:", error);
      setError("Failed to fetch account balance. Please try again.");
      setLoading(false);
      return;
    }

    // console.log(`Submitting email: ${email}`); // Debugging line
    // console.log(`Submitting password: ${password}`); // Debugging line

    try {
      // Prepare the data in x-www-form-urlencoded format
      const formData = new URLSearchParams();
      formData.append("type", selectedAgent);
      formData.append("located", located);
      formData.append("description", description);
      formData.append("call", userPhone);
      formData.append("whatsapp", whatsapp);
      formData.append("email", emailbread);
      formData.append("user", userbread);
      formData.append("fullName", fullName);
      formData.append("longitude", locationM.longitude);
      formData.append("latitude", locationM.latitude);

      // Send the data
      // const response = await axios.post(
      //   "http://localhost:4000/api/become-agent",
      //   formData,
      //   {
      //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
      //   }
      // );
      const redirect = () => {
        // Get the redirect path from the URL parameters
        const redirectPath =
          new URLSearchParams(location.search).get("redirect") || "/agents";

        // Navigate to the original destination or a default page
        navigate(redirectPath);
      };

      // console.log("you have been added as agent", response.data);

      setModalContent(
        <div>
          <h1 className="text-gradient"> Pending !! </h1>
          <p>
            {" "}
            Dear {fullName}. Your request has been recieved. An interview would
            be conducted on your whatsapp number by one of our customer agents
            within the next 24-48 hours{" "}
          </p>
          <button
            style={{
              marginTop: "20px",
              background: "#ff0000",
              color: "#fff",
              border: "none",
              padding: "10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowModal(false);
              redirect();
            }} // Close the modal when clicked
          >
            Close
          </button>
        </div>
      );

      const response = await axios.post(
        `${apiUrls}/api/become-agent`,
        formData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      setShowModal(true);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
        setShowModal(false);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewTypeChange = (agentId, type) => {
    setReviewType((prev) => ({
      ...prev,
      [agentId]: type,
    }));
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo-login">
          <img src={logo} alt="Logo" className="icon_header logo" />
        </div>
        <h2 className="login-title text-gradient  becomeAgent">
          {" "}
          Become Agent{" "}
        </h2>
        {error && <p className="error-message">{error}</p>}

        <br></br>

        <div className="input-group input-email">
          <select
            className="input-select "
            id="agent-select"
            value={selectedAgent}
            onChange={handleSelectChange}
            required
          >
            <option value="">--Please choose an option--</option>
            <option value="repairagents">Repair Agent</option>
            <option value="foodagents">Food Agent</option>
            <option value="cybercafeagents">Cybercafe Agent</option>
            <option value="deliveryagents">Delivery Agent</option>
            <option value="rideragents">Rider Agent</option>
            {/* <option value="schoolfeeagents">Schoolfees Agent</option> */}
            <option value="whatsapptvagents">Whatsapp Tv Agent</option>
          </select>
        </div>

        <div className="input-group input-email">
          <input
            maxLength={maxLength}
            type="text" // Changed to 'email' for validation
            id="full_name"
            placeholder={fullName}
            value={fullName}
            readOnly
            // onChange={(e) => setCall(e.target.value)}
            required // Added for form validation
            className="bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="input-group input-email">
          <input
            maxLength={maxLengthL}
            type="text" // Changed to 'email' for validation
            id="located"
            placeholder="location around Unizik"
            value={located}
            onChange={(e) => setLocated(e.target.value)}
            required // Added for form validation
          />
        </div>

        <div className="input-group">
          <input
            type="tel"
            maxLength={maxLength}
            id="number"
            placeholder={userPhone}
            value={userPhone}
            readOnly
            // onChange={(e) => setCall(e.target.value)}
            required // Added for form validation
            className="bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="input-group">
          <input
            maxLength={16} // Adjust the max length as needed
            type="tel"
            id="description"
            placeholder="Whatsapp Number (10-digit)"
            value={whatsapp}
            onChange={handlePhoneChange}
            onFocus={handleFocus} // Triggered when the input is clicked
            required // Added for form validation
          />
        </div>
        <div className="input-group">
          <textarea
            className="textarea-description"
            maxLength={maxLength}
            placeholder="Describe your business and list your prices to target only serious customers"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        {permission === "denied" && (
          <p style={{ color: "red" }}>
            Location permission denied. Please allow location access to submit
            the form. you can change browser or clear your browser data to
            resubmit
          </p>
        )}
        {permission === "unsupported" && (
          <p style={{ color: "red" }}>
            Geolocation is not supported by your browser.
          </p>
        )}
        {permission === "error" && (
          <p style={{ color: "red" }}>
            An error occurred while accessing location: {location.error}
          </p>
        )}
        <button
          className="login-button bg-blue-gradient"
          type="submit"
          disabled={loading || permission !== "granted"}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);

          localStorage.removeItem("showModal");
        }}
        content={modalContent}
      />
    </div>
  );
}

export default BecomeAgent;
