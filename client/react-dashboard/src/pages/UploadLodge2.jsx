import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../style";
import "../App.css";
import { logo } from "../assets";
import AuthContext from "../AuthContext";

function UploadLodge() {
  const [located, setLocated] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFiles, setSelectedFiles] = useState([null, null, null]); // For three files
  const [permission, setPermission] = useState(null);
  const [locationM, setLocationM] = useState({
    latitude: null,
    longitude: null,
    error: null,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const maxFileSize = 5 * 1024 * 1024;

  const { isAuthenticated, user, login } = useContext(AuthContext);
  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId;
  const emailbread = user?.email;

  const maxLengthN = 20;
  const maxLengthD = 200;
  const maxLengthL = 25;
  const maxLengthP = 15;
  const apiUrls = process.env.REACT_APP_API_URL;
  const apiUrl = "http://localhost:4000";

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
          if (error.code === 1) {
            // Permission denied
            setPermission("denied");
          } else {
            setPermission("error");
          }
          setLocationM({
            latitude: null,
            longitude: null,
            error: error.message,
          });
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
  }, []);

  const handleFileChange = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const fileSize = file.size;
      const fileType = file.type.toLowerCase();
      if (fileSize > maxFileSize) {
        setError("File exceeds the maximum allowed size of 5MB.");
        return;
      }
      if (
        ![
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/heif",
          "image/heic",
        ].includes(fileType)
      ) {
        setError("Only PNG, JPG, WEBP, HEIC, and HEIF formats are allowed.");
        return;
      }

      const newFiles = [...selectedFiles];
      newFiles[index] = file;
      setSelectedFiles(newFiles);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles[index] = null;
    setSelectedFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("user", userbread);
      formData.append("located", located);
      formData.append("description", description);
      formData.append("name", name);
      formData.append("price", price);

      selectedFiles.forEach((file) => {
        if (file) formData.append("files", file);
      });

      const response = await axios.post(
        `${apiUrls}/api/upload-lodge`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const redirectPath =
        new URLSearchParams(location.search).get("redirect") || "/buysells";
      navigate(redirectPath);
    } catch (error) {
      setError(
        error.response
          ? error.response.data.message
          : "An unexpected error occurred."
      );
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
        <h2 className="login-title text-gradient">Upload Lodge</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="input-group input-email">
          <input
            maxLength={maxLengthN}
            type="text"
            id="name"
            placeholder="Name of Property"
            value={name}
            onClick={() => {
              setErrorMessage("");
              setError("");
            }}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            maxLength={maxLengthL}
            id="located"
            placeholder="Location Around Unizik, Awka"
            value={located}
            onClick={() => {
              setErrorMessage("");
              setError("");
            }}
            onChange={(e) => setLocated(e.target.value)}
            required
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
            required
          />
        </div>

        <div className="input-group">
          <textarea
            className="textarea-description"
            maxLength={maxLengthD}
            placeholder="Describe your Item in few words"
            value={description}
            onClick={() => {
              setErrorMessage("");
              setError("");
            }}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="uploadFiles">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="input-group inputGroupFile" key={index}>
              <input
                type="file"
                id={`file-input-${index}`}
                accept="image/*"
                onClick={() => {
                  setErrorMessage("");
                  setError("");
                }}
                onChange={(event) => handleFileChange(index, event)}
                className="file-input"
                style={{ display: "none" }}
              />
              <label
                htmlFor={`file-input-${index}`}
                className="file-upload-card"
              >
                <span className="plus-icon">+</span>
                <p className="shortInputFileName">
                  {selectedFiles[index] ? selectedFiles[index].name : "upload"}
                </p>
              </label>
              <button
                type="button"
                className="delete-button"
                onClick={() => handleRemoveFile(index)}
                style={{ display: selectedFiles[index] ? "block" : "none" }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

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
    </div>
  );
}

export default UploadLodge;
