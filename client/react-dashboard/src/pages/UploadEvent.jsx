import React from "react";
import axios from "axios";
import { useEffect, useContext, useState } from "react";
import styles from "../style"; // Ensure this path is correct
import "../App.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logo } from "../assets"; // Corrected import
import AuthContext from "../AuthContext";
import { BsXLg, BsCashCoin } from "react-icons/bs";
import Modal from "../components/Modal";

function UploadEvent() {
  const [located, setLocated] = useState("");
  const apiUrl = "http://localhost:4000";
  const apiUrls = process.env.REACT_APP_API_URL;
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const maxFileSize = 5 * 1024 * 1024; // Add state for file
  const [permission, setPermission] = useState(null);
  const [locationM, setLocationM] = useState({
    latitude: null,
    longitude: null,
    error: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const { isAuthenticated, user, login } = useContext(AuthContext);
  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId; // Optional chaining to avoid errors if user is null
  const emailbread = user.email;

  const maxLength = 250;
  const maxLengthN = 20;
  const maxLengthD = 200;
  const maxLengthL = 25;
  const maxLengthP = 15;

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
                  type: "uploadEvent",
                  user_id: userbread,
                });
              } catch (postError) {
                console.error("Error posting denied location:", postError);
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
  }, []); // Add dependencies if needed

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const fileSize = selectedFile.size;
      const fileType = selectedFile.type;

      // Check file size
      if (fileSize > maxFileSize) {
        setErrorMessage("File size exceeds the maximum allowed size of 5MB.");
        setSelectedFile(null); // Reset the file
        return;
      }

      // Check file type (only allow PNG and JPG)
      if (
        fileType.toLowerCase() !== "image/png" &&
        fileType.toLowerCase() !== "image/jpeg" &&
        fileType.toLowerCase() !== "image/webp" &&
        fileType.toLowerCase() !== "image/heif" &&
        fileType.toLowerCase() !== "image/heic"
      ) {
        setErrorMessage("Only (PNG/JPG/WEBP/HEIC/HEIF) formats are allowed.");
        setSelectedFile(null); // Reset the file
        return;
      }

      // If validation passes, reset error and set file
      setErrorMessage("");
      setSelectedFile(selectedFile);
    }
  };

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
      if (accountBalance < 500) {
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
              You need at least 500 naira in your account to upload Event.
              Please fund your account and try again.
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
      const formData = new FormData();
      formData.append("user", userbread);
      formData.append("located", located);
      formData.append("event_date", eventDate);
      formData.append("description", description);
      formData.append("name", name);
      formData.append("price", price);
      formData.append("longitude", locationM.longitude);
      formData.append("latitude", locationM.latitude);

      if (selectedFile) {
        formData.append("file", selectedFile); // Ensure selectedFile is a File object
      } else {
        throw new Error("No file selected");
      }

      // Send the data
      const response = await axios.post(
        `${apiUrls}/api/upload-event`,
        formData
        // {
        //   headers: { "Content-Type": "multipart/form-data" },
        // }
      );

      // Get the redirect path from the URL parameters
      const redirectPath =
        new URLSearchParams(location.search).get("redirect") || "/events";

      // Navigate to the original destination or a default page
      navigate(redirectPath);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container bg-black-gradient">
      <form
        className="login-form"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
      >
        <div className="logo-login">
          <img src={logo} alt="Logo" className="icon_header logo" />
        </div>
        {/* <h2 className="login-title text-gradient">Upload Event</h2> */}
        {error && <p className="error-message">{error}</p>}

        <div className="input-group input-email">
          <input
            maxLength={maxLengthN}
            type="text" // Changed to 'email' for validation
            id="name"
            placeholder="Name of Event"
            value={name}
            onClick={() => {
              setErrorMessage("");
              setError("");
            }}
            onChange={(e) => setName(e.target.value)}
            required // Added for form validation
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            maxLength={maxLengthL}
            id="located"
            placeholder="Venue"
            value={located}
            onClick={() => {
              setErrorMessage("");
              setError("");
            }}
            onChange={(e) => setLocated(e.target.value)}
            required // Added for form validation
          />
        </div>

        <div className="input-group">
          <input
            type="Date"
            maxLength={maxLengthL}
            id="event_date"
            placeholder="Event Date"
            value={eventDate}
            onClick={() => {
              setErrorMessage("");
              setError("");
            }}
            onChange={(e) => setEventDate(e.target.value)}
            required // Added for form validation
          />
        </div>

        <div className="input-group">
          <input
            maxLength={maxLengthP}
            type="number"
            id="price"
            placeholder="Price in Naira"
            value={price}
            onClick={() => {
              setErrorMessage("");
              setError("");
            }}
            onChange={(e) => setPrice(e.target.value)}
            required // Added for form validation
          />
        </div>
        <div className="input-group">
          <textarea
            className="textarea-description"
            maxLength={maxLengthD}
            placeholder="Describe The event and requirements to attend"
            value={description}
            onClick={() => {
              setErrorMessage("");
              setError("");
            }}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="input-group">
          <input
            type="file"
            id="file"
            placeholder="Choose a file"
            onClick={() => {
              setErrorMessage("");
              setError("");
            }}
            required
            onChange={handleFileChange}
          />
        </div>
        <p className="pictureItem">
          {" "}
          {errorMessage ? (
            <p className="errorMessage"> {errorMessage} </p>
          ) : (
            "Flier of Event"
          )}
        </p>

        {permission === "denied" && (
          <p style={{ color: "red" }}>
            Location permission denied. Please allow location access to submit
            the form.
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
export default UploadEvent;
