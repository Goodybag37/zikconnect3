import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import "../App.css";
import ReactPaginate from "react-paginate";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { BisPhoneCall } from "@meronex/icons/bi/";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import Modal from "../components/Modal";
import AuthContext from "../AuthContext";
import Popup from "./Popup";
import { LogoWhatsapp } from "@meronex/icons/ios/";

import {
  BsZoomIn,
  BsPatchCheckFill,
  BsFillPersonXFill,
  BsXOctagonFill,
  BsBrowserEdge,
} from "react-icons/bs";
import { Link, useNavigate, useLocation } from "react-router-dom";
// import { io } from "socket.io-client"; // WebSocket client
import {
  BsFillArchiveFill,
  BsFileEarmarkPerson,
  BsFillPersonFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsEyedropper,
  BsFillBellFill,
  BsXLg,
  BsCashCoin,
  BsArchiveFill,
} from "react-icons/bs";

// const socket = io("${apiUrls}/api");

function YourComponent() {
  const [events, setevents] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [connecting, setConnecting] = useState({});
  const [flippedCards, setFlippedCards] = useState({});
  const [itemId, setItemId] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [stat, setStat] = useState("");
  const [buttonStatus, setButtonStatus] = useState({});
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [userIn, setUserIn] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isPopupVisible2, setIsPopupVisible2] = useState(false);
  const [editMode, setEditMode] = useState(false); // State to manage edit mode
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    price: "",
    location: "",
  });
  const locationRef = useRef(null);
  const [locationA, setLocationA] = useState({
    latitude: null,
    longitude: null,
    error: null,
  });
  const [orderCode, setOrderCode] = useState("");
  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;

  const { isAuthenticated, user, login } = useContext(AuthContext);

  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId; // Optional chaining to avoid errors if user is null

  const emailbread =
    user?.email || JSON.parse(localStorage.getItem("user"))?.email;
  const isPhoneVerified = user.isPhoneVerified;
  const [located, setLocated] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const maxFileSize = 5 * 1024 * 1024; // Add state for file
  const [itemToDelete, setItemToDelete] = useState(null);
  const [toggled, setToggled] = useState(true);
  const [viewMode, setViewMode] = useState("general");
  const [askToggle, setAskToggle] = useState(true); // "general" or "profile"
  const [type, setType] = useState("Automatic");
  const maxLength = 250;
  const maxLengthN = 20;
  const maxLengthD = 200;
  const maxLengthL = 25;
  const maxLengthP = 15;
  const apiUrls = process.env.REACT_APP_API_URL;
  const apiUrl = "http://localhost:4000";
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

  const fetchData = async (page, searchQuery) => {
    try {
      const response = await axios.get(`${apiUrls}/api/eventapi`, {
        params: {
          page: page + 1,
          pageSize: usersPerPage,
          search: searchQuery,
          viewMode: viewMode, // Pass the search query to the backend
        },
      });
      console.log(response);
      const { events: newEvents, totalPages: newTotalPages } = response.data;
      setevents(newEvents);

      await fetchSettingStatus(userbread); // Only if fetchSettingStatus is async

      setTotalPages(newTotalPages);
      setUserIn(userbread);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckboxChange = async (event) => {
    if (event.target.checked) {
      setAskToggle(false);

      try {
        // Determine the new status based on the current state

        // Send a POST request to update the status in the database
        await axios.post(
          `${apiUrls}/api/preference-toggleask/`,
          {
            userId: userbread,
            // or any other identifier if needed
          },
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        // Update the state to reflect the new status
      } catch (error) {
        console.error("Error updating status:", error);
      }
    } else {
      // Code to execute when the checkbox is unchecked
      console.log("Checkbox unchecked");
    }
  };

  const fetchSettingStatus = async (userId) => {
    try {
      // Ensure the API endpoint is correct and accessible
      const response = await axios.get(`${apiUrls}/api/get-status/${userId}`);

      // Make sure the data structure matches
      const settings = response.data;

      // Debug: Check what `settings` contains
      console.log("Fetched settings:", settings);

      // Access the toggle_status object safely
      if (settings && settings.toggle_status && settings.toggle_status.event) {
        const toggleStatus = settings.toggle_status.event;
        const toggleAsk = settings.preferences.toggle_ask;

        if (toggleAsk === "yes") {
          setAskToggle(true);
        } else {
          setAskToggle(false);
        }

        console.log("you tried getting status", toggleStatus);

        // Update state based on the toggle status
        if (toggleStatus === "available") {
          setToggled(true);
        } else if (toggleStatus === "unavailable") {
          setToggled(false);
        }
        return toggleStatus;
      } else {
        console.error("Toggle status not found in settings");
        return null;
      }
    } catch (error) {
      // Handle errors, including network errors
      console.error("Error fetching status:", error);
      return null;
    }
  };

  const handleToggleClick = async () => {
    setIsPopupVisible2(true);
    try {
      // Determine the new status based on the current state
      const newStatus = toggled === true ? "unavailable" : "available";
      const type = "event";

      // Send a POST request to update the status in the database
      await axios.post(
        `${apiUrls}/api/update-status/${type}`,
        {
          status: newStatus,
          userId: userbread,
          // or any other identifier if needed
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      // Update the state to reflect the new status
      setToggled(!toggled);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleConnectClick = async (itemId) => {
    setConnecting((prevState) => ({
      ...prevState,
      [itemId]: "connecting",
    }));
    if (!isPhoneVerified) {
      const content4 = (
        <>
          <div className="verifyPopup">
            <h2 className="popupHeading inline">Verify Phone !!</h2>
            <BsXLg
              className="text-gradient closeModal4"
              onClick={() => setShowModal(false)}
            />
          </div>
          <p className="popup-paragraph">
            You need to verify your phone number to connect with the seller.
            This helps them contact you after you connect.
          </p>
          <Link to="/verifyphone">
            <button className="bg-blue-gradient roommate-button connect-accept-button">
              <BisPhoneCall className="connect_icon" />
              Verify Now
            </button>
          </Link>
        </>
      );
      setShowModal(true);
      setModalContent(content4);
      setConnecting((prevState) => ({
        ...prevState,
        [itemId]: "",
      }));
      return;
    }

    try {
      const response = await axios.get(
        `${apiUrls}/api/get-account-balance?userId=${userbread}`
      );

      const accountBalance = response.data.account_balance;
      console.log("Account balance is", accountBalance);

      if (accountBalance < 100) {
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
              You have hit a low account balance. You need at least 100 naira to
              connect with an agent. Please fund your account to continue.
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
        setConnecting((prevState) => ({
          ...prevState,
          [itemId]: "",
        }));
        return;
      }
    } catch (error) {
      console.error("Error fetching account balance:", error);
      // Optionally show an error message to the user here
    }

    // const response = await axios.get(
    //   `${apiUrls}/api/connect-buysell?itemId=${itemId}`
    // );

    // const connectStatus = response.data.status;

    // if (connectStatus == "order") {
    //   const content5 = (
    //     <>
    //       <div className="verifyPopup">
    //         <h2 className="popupHeading inline">In Order...</h2>
    //         <BsXLg
    //           className="text-gradient closeModal4"
    //           onClick={() => setShowModal(false)}
    //         />
    //       </div>
    //       <p className="popup-paragraph">
    //         Ooops!! sorry this item is already in order with a user, please
    //         select another item.
    //       </p>
    //     </>
    //   );

    //   setShowModal(true);
    //   setModalContent(content5);
    //   setConnecting((prevState) => ({
    //     ...prevState,
    //     [itemId]: "",
    //   }));
    //   return;
    // }

    const processConnection = async (
      agentId,
      latitude,
      longitude,
      locationM
    ) => {
      console.log(
        "make i see wetin sup",
        agentId,
        latitude,
        longitude,
        locationM
      );
      let distance = null;
      let duration = null;
      let display_name = null;
      if (locationM === undefined || locationM === null) {
        try {
          const response = await axios.get(
            `${apiUrls}/api/get-distance?itemId=${agentId}&latitude=${latitude}&longitude=${longitude}`
          );
          distance = response.data.distance;
          duration = response.data.duration;
          display_name = response.data.display_name;
        } catch (error) {}
      }

      // Check countdown after location permission is granted
      // if (countdownEndTime && new Date() < countdownEndTime) {
      //   // Show the modal for countdown
      //   setShowModal(true);
      //   return;
      // }
      console.log("something reach this side ");
      setShowModal(true);

      const generateUniqueCode = () => {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        const charactersLength = characters.length;

        for (let i = 0; i < 32; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }

        return result;
      };

      const newCode = generateUniqueCode();
      setOrderCode(newCode);

      const selectedAgent = events.find((agent) => agent.id === itemId);
      // setSelectedAgent(selectedAgent);
      const selected = selectedAgent.contact;
      console.log(selected);

      // const endTime = new Date(new Date().getTime() + 10 * 60 * 1000);
      // localStorage.setItem("countdownEndTime", endTime.toISOString());

      // setTimeout(() => {
      const content = (
        <>
          <div className="locationInfo">
            <h2 className=" text-gradient popup-heading">New Order</h2>
            <p className="popup-paragraph">
              You have placed an order for this item. the details of your order
              are listed below
            </p>
            <h4 className="popup-heading">Details</h4>
            <p className="locationInfo">Order Number: {newCode}</p>

            {selectedAgent && (
              <>
                <p className="locationInfo">Item ID: {itemId}</p>
                <p className="locationInfo">
                  Seller Full Name: {selectedAgent.seller_name}
                </p>
                <p className="locationInfo">
                  Seller ID: {selectedAgent.fk_user_id}
                </p>
                <p className="locationInfo">
                  Item Summary: {selectedAgent.name}/
                  {selectedAgent.formatted_price}/{selectedAgent.location}
                </p>
                <h3 className="text-gradient"> Gps Tracker </h3>
                <p className="locationInfo">Seller Location : {display_name}</p>
                <p className="locationInfo">
                  Distance beween you two:{" "}
                  {distance + " kilometers" ||
                    "Manual locations cant calculate distance"}
                </p>
                <p className="locationInfo">
                  Duration:{" "}
                  {duration + "  minutes" ||
                    "Manual locations cant calculate duration"}
                </p>
                <br></br>
                <div className="chat-call-buttons">
                  <a href={`https://wa.me/${selectedAgent.contact}`}>
                    <button className="bg-blue-gradient roommate-button  connect-accept-button-chat-buysell">
                      <LogoWhatsapp className="connect_icon" />
                      Chat
                    </button>
                  </a>
                  <a href={`tel:${selectedAgent.contact}`}>
                    <button className="bg-blue-gradient roommate-button connect-accept-button">
                      <BisPhoneCall className="connect_icon" />
                      Call
                    </button>
                  </a>
                </div>

                <h3 className="text-gradient">Fraud Prevention !!</h3>

                <ol>
                  <li>
                    The seller is responsible for bringing the item to you
                    before you pay{" "}
                  </li>
                  <br></br>
                  <li>Do not pay for the item without physical inspection</li>
                  <br></br>
                  <li>
                    Request For a whatsapp video call if you need more enquiry
                    about the item or seller identity
                  </li>
                  <br></br>
                  <li>
                    Make payment to an account bearing the same full name as the
                    seller, this would provide us enough proof to investigate
                    the transaction if issues arise.
                  </li>
                </ol>
              </>
            )}
            {/* <CountdownTimer
            endTime={endTime}
            onEnd={() => {
              setConnecting((prevState) => ({
                ...prevState,
                [agentId]: "",
              }));
              setShowModal(false);
            }} // Close modal when countdown ends
          /> */}

            <button
              onClick={() => {
                setConnecting((prevState) => ({
                  ...prevState,
                  [itemId]: "",
                }));
                setShowModal(false);
              }}
              className="signoutButton profileParagraph text-gradient"
            >
              Back to Agents
            </button>
          </div>
        </>
      );

      setModalContent(content);
      setShowModal(true);
      // }, 0);

      try {
        const userId = userbread;
        const agentType = "event";
        const agentUserId = selectedAgent.fk_user_id;

        await axios.post(
          `${apiUrls}/api/send-connect-email`,
          {
            agentId: itemId,
            userId: userId,
            orderId: newCode,
            agentType: agentType,
            agentUserId: agentUserId,
            latitude: latitude ? latitude : null, // Send latitude and longitude
            longitude: longitude ? longitude : null,
            locationM: locationM,
            type: type,
          },
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        console.log(
          `Email sent to agent with ID: ${itemId} ${type} ${locationM}`
        );
      } catch (error) {
        console.error("Error sending email:", error);
      }
    };

    const locationDetails = JSON.parse(localStorage.getItem("locationDetails"));

    if (locationDetails) {
      const latitude = locationDetails.latitude;
      const longitude = locationDetails.longitude;
      console.log("nah here things follow sup", latitude, longitude);
      processConnection(itemId, latitude, longitude);

      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Location granted:", latitude, longitude);

          // Process connection with the granted location
          processConnection(itemId, latitude, longitude);
          localStorage.setItem(
            "locationDetails",
            JSON.stringify({ latitude: latitude, longitude: longitude })
          );
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            // Logic for denied location access
            const locationContent = (
              <>
                <div className="verifyPopup">
                  <h2 className="popupHeading inline">
                    {type === "Automatic"
                      ? "Location Access Denied"
                      : "Manual Location"}
                  </h2>
                  <BsXLg
                    className="text-gradient closeModal4"
                    onClick={() => {
                      setConnecting((prevState) => ({
                        ...prevState,
                        [itemId]: "",
                      }));
                      // setButtonStatus((prevState) => ({
                      //   ...prevState,
                      //   [itemId]: "available",
                      // }));
                      setShowModal(false);
                    }}
                  />
                </div>
                {type == "Automatic" && (
                  <div>
                    <p className="popup-paragraph">
                      You need to allow location so our agents can serve you
                      more efficiently. Zikconnect respects our users privacy so
                      your location would only be used for this order.
                    </p>
                    <div className="locationInfo">
                      <h3 className="text-gradient">On Iphone</h3>

                      <ul>
                        <li> Clear your browser cache and try again </li>
                        <p> OR</p>
                        <li>
                          Go to Settings {">>"} Privacy & Security {">>"}{" "}
                          Location Services. {">>"} Safari Websites {">>"}{" "}
                          Ask/Allow
                        </li>

                        <p> OR</p>
                        <li>
                          Go to Settings {">>"} Safari {">>"} Privacy & Security{" "}
                          {">>"} Location {">>"} Ask/Allow{" "}
                        </li>
                      </ul>

                      <h3 className="text-gradient">On Android</h3>
                      <ul>
                        <li> Clear your browser cache and try again </li>
                        <p> OR</p>

                        <li>
                          {" "}
                          Open Chrome {">>"} Tap the 3-dot on the top-right
                          corner {">>"} Site Settings {">>"} Location {">>"}{" "}
                          Here, you can see the list of blocked and allowed
                          sites.
                        </li>
                        <br></br>
                        <li>
                          {" "}
                          If the website is blocked, find it in the blocked
                          list, tap on it, and select Clear & reset to remove
                          the block.
                        </li>
                      </ul>
                    </div>
                    <button
                      className="signoutButton profileParagraph text-gradient"
                      onClick={() => {
                        setShowModal(false);
                        setType("Manual");
                        setConnecting((prevState) => ({
                          ...prevState,
                          [itemId]: "",
                        }));
                      }}
                    >
                      Input Location Manually
                    </button>
                  </div>
                )}{" "}
                {type == "Manual" && (
                  <div className="locationForm">
                    <div className="input-group input-email">
                      <input
                        maxLength={maxLength}
                        type="text"
                        id="located"
                        ref={locationRef} // Use ref here instead of value
                        placeholder="Exact Adress Around Unizik"
                        // onChange={(e) => setLocationM(e.target.value)}
                      />
                    </div>
                    <button
                      className="signoutButton profileParagraph text-gradient"
                      onClick={() => {
                        const manualLocation = locationRef.current.value;
                        setShowModal(false);
                        // Handle manual location input logic
                        setLocationA({
                          latitude: null,
                          longitude: null,
                          locationM: manualLocation, // Use the manual input state
                          error: null,
                        });

                        processConnection(itemId, null, null, manualLocation);
                        setConnecting((prevState) => ({
                          ...prevState,
                          [itemId]: "",
                        }));
                      }}
                    >
                      Connect
                    </button>
                  </div>
                )}
              </>
            );
            setShowModal(true);
            setModalContent(locationContent);
          }
          return;
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }

    // try {
    //   // Update button status
    //   setButtonStatus((prevState) => ({
    //     ...prevState,
    //     [itemId]: "in order",
    //   }));

    //   // Send connection request to backend
    //   await axios.post(
    //     `${apiUrls}/api/connectbuysell`,
    //     { itemId },
    //     { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    //   );
    // } catch (error) {
    //   console.error("Error connecting:", error);
    //   // Optionally show error feedback to the user here
    // }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    setPageNumber(0);
    fetchData(0, searchQuery); // Fetch data based on the search query
  };

  useEffect(() => {
    fetchData(pageNumber, searchQuery);
  }, [pageNumber, searchQuery]);

  const handleShowPicture = async (itemId) => {
    try {
      const response = await axios.get(`${apiUrls}/api/event/${itemId}`, {
        responseType: "blob", // Important: Fetch the image as a Blob
        validateStatus: (status) => status < 500,
      });

      if (response.status === 404) {
        // Check if the Blob is empty, indicating no image was found
        setModalContent(
          <div>
            <p>No Flier found for this event.</p>
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
              onClick={() => setShowModal(false)} // Close the modal when clicked
            >
              Close
            </button>
          </div>
        );
      } else {
        // If the image exists, display it
        const imageUrl = URL.createObjectURL(response.data);

        setModalContent(
          <div style={{ position: "relative" }}>
            <img
              src={imageUrl}
              alt="Item"
              style={{
                width: "100%",
                height: "auto",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
            <button
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#ff0000",
                color: "#fff",
                border: "none",
                padding: "10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => setShowModal(false)} // Close the modal when clicked
            >
              Close
            </button>
          </div>
        );
      }

      setShowModal(true); // Show the modal with the image
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const all = () => {
    setSearchQuery(""); // Reset the search query to an empty string
    setPageNumber(0);
    setViewMode("general");
    setSelectedAgent(""); // Reset the page number to the first page
    fetchData(pageNumber, ""); // Fetch all data without any search query
  };

  useEffect(() => {
    fetchData(pageNumber);
  }, [pageNumber]);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value); // Update search term as user types
  };
  const handleDeleteClick = (itemId) => {
    setItemToDelete(itemId);
    setIsPopupVisible(true);
  };
  const handleEditClick = (event) => {
    console.log("event", event);
    setEditData({
      name: event.name,
      description: event.description,
      price: event.formatted_price,
      location: event.location,
    });
    setItemId(event.id);

    console.log("editdata", editData);
  };

  const handleDeleteItem = async () => {
    setIsPopupVisible(false);
    setevents((prevEvents) =>
      prevEvents.filter((event) => event.id !== itemToDelete)
    );

    try {
      await axios.post(`${apiUrls}/api/delete-upload/${itemToDelete}`, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const cancelDelete = () => {
    setIsPopupVisible(false);
    setItemToDelete(null);
  };

  const handleEditSubmit = async (event) => {
    console.log("edit submitt", editData.name);
    event.preventDefault();
    try {
      const formData = new FormData();
      const type = "event";
      // Append other data fields to FormData
      formData.append("name", editData.name);
      formData.append("description", editData.description);
      formData.append("price", editData.price);
      formData.append("location", editData.location);

      // Append the file only if a new one is selected
      if (selectedFile) {
        formData.append("file", selectedFile); // Add the new file to the FormData
      }

      // Send the FormData to the server using a PUT request
      await axios.put(
        `${apiUrls}/api/edit-upload/${itemId}&type=${type}`,
        formData

        // Send FormData instead of JSON
      );

      // Refresh data after successful update
      fetchData(pageNumber, searchQuery);
      setFlippedCards(false); // Exit edit mode
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  function createCard(event) {
    const isFlipped = flippedCards[event.id];

    return (
      <div
        className={`cardBuysell bg-black-gradient ${
          isFlipped ? "flipped" : ""
        } `}
      >
        <div className={`card-inner ${isFlipped ? "flippedCard" : ""}`}>
          {isFlipped ? (
            <form encType="multipart/form-data" onSubmit={handleEditSubmit}>
              {error && <p className="error-message">{error}</p>}
              <BsXLg
                className="text-gradient  text-gradient cardIconFlip"
                onClick={() => handleFlip(event.id)}
              />
              <div className="inputGroup2 ">
                <input
                  maxLength={maxLengthN}
                  type="text" // Changed to 'email' for validation
                  id="name"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  placeholder="Name"
                  onClick={() => {
                    setErrorMessage("");
                    setError("");
                  }}
                  required // Added for form validation
                />
              </div>

              <div className="inputGroup2 ">
                <input
                  type="text"
                  maxLength={maxLengthL}
                  id="located"
                  value={editData.location}
                  onChange={(e) =>
                    setEditData({ ...editData, location: e.target.value })
                  }
                  placeholder="Location"
                  onClick={() => {
                    setErrorMessage("");
                    setError("");
                  }}
                  required // Added for form validation
                />
              </div>

              <div className="inputGroup2 ">
                <input
                  maxLength={maxLengthP}
                  type="number"
                  id="price"
                  value={editData.price}
                  onChange={(e) =>
                    setEditData({ ...editData, price: e.target.value })
                  }
                  placeholder="Price"
                  onClick={() => {
                    setErrorMessage("");
                    setError("");
                  }}
                  required // Added for form validation
                />
              </div>
              <div className="inputGroup2 ">
                <textarea
                  className="textareaDescription"
                  maxLength={maxLengthD}
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  placeholder="Description"
                  onClick={() => {
                    setErrorMessage("");
                    setError("");
                  }}
                  required
                ></textarea>
              </div>
              <br />
              <div className="inputGroup2 pictureError">
                <input
                  className="pictureEdit"
                  type="file"
                  id="file"
                  placeholder={event.original_name}
                  onClick={() => {
                    setErrorMessage("");
                    setError("");
                  }}
                  onChange={handleFileChange}
                />

                <p className="pictureItemBuysell">
                  {" "}
                  {errorMessage ? (
                    <p className=""> {errorMessage} </p>
                  ) : (
                    "Change Picture(optional)"
                  )}
                </p>
              </div>
              <br />
              <br />

              <button
                type="submit"
                className="signout-button profileParagraph text-gradient"
              >
                {" "}
                <BsFillPersonXFill />
                Save Changes
              </button>
            </form>
          ) : (
            <div key={event.id}>
              <ul className="roommate-list-head">
                <li>
                  <div className="profilePicRoommate">
                    <div className="profileHeaderR bg-blue-gradient">
                      <p className="profileInfo">{event.name}</p>
                    </div>
                    <p className="profile-body">
                      {event.description}
                      <br />
                      <hr />
                      Price: {event.formatted_price}
                    </p>
                  </div>
                </li>

                <li className="roommateList">
                  Venue:
                  {event.location}
                </li>
                <hr />
                <li className="roommateList">On : {event.formatted_date}</li>
                <hr />
                <li className="roommateList">By : {event.seller_name}</li>
                <li className="roommate-list">
                  <button
                    className="bg-blue-gradient roommateButtonConnect"
                    disabled={
                      buttonStatus[event.status] === "order" ||
                      // selectedAgent ||
                      event.fk_user_id === userIn
                    }
                    onClick={() => handleConnectClick(event.id)}
                  >
                    <BsBrowserEdge className="connect_icon" />

                    {connecting[event.id] ? "Connecting..." : "Buy Ticket"}
                  </button>

                  <button
                    onClick={() => handleShowPicture(event.id)}
                    className="roommateButtonPicture "
                  >
                    <BsPeopleFill className="connect_icon" />
                    See Flier
                  </button>
                  {selectedAgent && (
                    <BsArchiveFill
                      className="text-gradient cardIconDelete"
                      onClick={() => {
                        handleDeleteClick(event.id);
                      }}
                    />
                  )}

                  {selectedAgent && (
                    <BsEyedropper
                      className="text-gradient cardIconFlip2"
                      onClick={() => {
                        handleEditClick(event);
                        handleFlip(event.id);
                      }}
                    />
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
  const filteredEvents = events.filter((event) => {
    if (viewMode === "general") {
      return event.status === "available" || event.status === "order";
    }
    return true; // Show all items in profile view
  });

  const displayUsers = filteredEvents
    .filter((event) =>
      selectedAgent ? event.fk_user_id === selectedAgent : true
    )
    .map(createCard);

  const displayUsers2 = filteredEvents.map(createCard);

  return (
    <main className="main-container">
      <div className="main-title">
        <form className="inputGroup box-shadow" onSubmit={handleSearchSubmit}>
          <div className="inputGroup box-shadow">
            <input
              type="text"
              name="department"
              className="inputSearch"
              placeholder="Search for item "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
            />
            <button type="submit" className="btn btn--accent searchButton">
              <BsZoomIn className="search" />
            </button>{" "}
            {/* <button type="submit" className="btn btn--accent search">
              {" "}
              Go{" "}
            </button> */}
          </div>
        </form>

        {selectedAgent && (
          <button
            className={`toggle-btn ${
              toggled ? "toggled bg-blue-gradient" : ""
            }`}
            onClick={handleToggleClick}
          >
            <div className="thumb"></div>
          </button>
        )}

        <p onClick={all} className="buysellAll text-gradient">
          {" "}
          All
        </p>
        <p
          onClick={() => {
            setSelectedAgent(userbread);
            setViewMode("profile");
          }}
          className="buysellProfile text-gradient"
        >
          {" "}
          <BsFillPersonFill />
          Profile
        </p>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="noItems ">
          <p>Oops!! No properties displayed 🥹</p>
        </div>
      ) : (
        <LazyLoadComponent>
          <div className="main-cards-roommates">{displayUsers}</div>
        </LazyLoadComponent>
      )}

      <div className="agent-footer">
        <Link to="/uploadevent">
          <button className="agent-button">
            <BsFileEarmarkPerson className="card_icon" />
            Upload Event
          </button>
        </Link>

        {totalPages > 0 && (
          <div className="pagination-container">
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              pageCount={totalPages}
              onPageChange={handlePageChange}
              containerClassName={"paginationBttns"}
              previousLinkClassName={"previousBttn"}
              nextLinkClassName={"nextBttn"}
              disabledClassName={"paginationDisabled"}
              activeClassNAme={"paginationActive"}
            />
          </div>
        )}
      </div>
      {isPopupVisible && (
        <Popup
          header="Delete Item"
          message="Are you sure you want to delete this item?"
          buttons={[
            {
              label: (
                <>
                  <BsPatchCheckFill className="connect_icon" /> Confirm
                </>
              ),
              onClick: handleDeleteItem,
            },
            {
              label: (
                <>
                  <BsXOctagonFill className="connect_icon" /> Cancel
                </>
              ),
              onClick: cancelDelete,
            },
          ]}
        />
      )}

      {isPopupVisible2 && askToggle && (
        <Popup
          header={toggled ? "Active Mode" : "Inactive Mode"}
          message={
            toggled
              ? "You have switched to active mode, your items are now visible to buyers."
              : "You have switched to inactive mode, your items are hidden from buyers."
          }
          buttons={[
            {
              label: (
                <>
                  <BsPatchCheckFill className="connect_icon" /> Confirm
                </>
              ),
              onClick: () => setIsPopupVisible2(false),
            }, // Fix here
          ]}
          checkbox={{
            label: "Don't ask again",
            onChange: handleCheckboxChange,
          }}
        />
      )}

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);

          localStorage.removeItem("showModal");
        }}
        content={modalContent}
      />
    </main>
  );
}

export default YourComponent;
