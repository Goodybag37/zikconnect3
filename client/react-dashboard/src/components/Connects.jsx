// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "../App.css";
// import { LazyLoadImage } from "react-lazy-load-image-component";
// import "react-lazy-load-image-component/src/effects/blur.css";
// import { LazyLoadComponent } from "react-lazy-load-image-component";
// import {
//   BsFillArchiveFill,
//   BsFileEarmarkPerson,
//   BsFillGrid3X3GapFill,
//   BsPeopleFill,
//   BsFillBellFill,
// } from "react-icons/bs";

// function YourComponent() {
//   const [profile, setProfile] = useState([]);
//   const [pageNumber, setPageNumber] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);

//   const usersPerPage = 10;
//   const pagesVisited = pageNumber * usersPerPage;

//   const fetchData = async (page) => {
//     try {
//       const response = await axios.get(`http://localhost:4000/profileapi`);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     fetchData(response);
//   }, []);

//   function createCard(user) {
//     return (
//       <div className="card-lodge">
//         <div className="card-inner">
//           <div key={user.id}>
//             <ul className="roommate-list-head">
//               <li>
//                 <div className="profilePic">
//                   <div className="profileHeader">
//                     <p className="profileInfo">Full name : {user.name}</p>
//                     <p className="profileInfo"> User: {user.id} </p>
//                   </div>
//                 </div>
//               </li>
//               <li className="roommate-list">Name: {user.name}</li>
//               <li className="roommate-list">Contact: {user.contact}</li>
//               <li className="roommate-list">
//                 <a href={`https://wa.me/${user.contact}`}>
//                   <button className="roommate-button">
//                     <BsPeopleFill className="connect_icon" />
//                     Chat Agent
//                   </button>
//                 </a>
//               </li>
//             </ul>
//           </div>
//           <BsFillArchiveFill className="card_icon" />
//         </div>
//         <h1>0</h1>
//       </div>
//     );
//   }

//   return (
//     <main className="main-container">
//       <div className="main-title">
//         <h1 className="agent-title"> PROFILE</h1>
//       </div>
//       <LazyLoadComponent>
//         <div className="main-cards-roommates">
//           {profile.length > 0 ? (
//             profile.map(createCard)
//           ) : (
//             <p>No agents available</p>
//           )}
//         </div>
//       </LazyLoadComponent>

//       <div className="agent-footer">
//         <button className="agent-button">
//           <BsFileEarmarkPerson className="card_icon" />
//           Become an agent
//         </button>
//         {totalPages > 0 && (
//           <div className="pagination-container">
//             <ReactPaginate
//               previousLabel={"Previous"}
//               nextLabel={"Next"}
//               pageCount={totalPages}
//               onPageChange={handlePageChange}
//               containerClassName={"paginationBttns"}
//               previousLinkClassName={"previousBttn"}
//               nextLinkClassName={"nextBttn"}
//               disabledClassName={"paginationDisabled"}
//               activeClassNAme={"paginationActive"}
//             />
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

// export default YourComponent;

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "../App.css";
import ReactPaginate from "react-paginate";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import Modal from "../components/Modal";
import AuthContext from "../AuthContext";
import Popup from "./Popup";
import CountdownTimer from "../components/Countdowntimer";
import {
  BsZoomIn,
  BsPatchCheckFill,
  BsFillPersonXFill,
  BsXOctagonFill,
  BsBrowserEdge,
  BsInfoCircleFill,
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
  BsArchiveFill,
} from "react-icons/bs";

// const socket = io("${apiUrls}/api");

function YourComponent() {
  const [buysells, setbuysells] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
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

  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;

  const { isAuthenticated, user, login } = useContext(AuthContext);
  const userbread = user.userId; // Optional chaining to avoid errors if user is null
  const emailbread = user.email;
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
  const [askToggle, setAskToggle] = useState(true);
  const [profile, setProfile] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState("Profile");

  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [acceptedMessages, setAcceptedMessages] = useState([]); // Array to track accepted message IDs
  const [countdownEndTime, setCountdownEndTime] = useState({});
  const [expired, setExpired] = useState({});
  const [showProfile, setShowProfile] = useState(false);

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

  const handleComponentChange = (event) => {
    setSelectedComponent(event.target.value);
  };

  // Render the selected component
  const renderComponent = () => {
    switch (selectedComponent) {
      case "Profile":
        return <Profile />;
      case "Lodge":
        return <Lodge />;
      default:
        return <Profile />; // Default to "Profile" if no valid selection
    }
  };

  const handleMessages = async () => {
    setShowMessages(!showMessages);
    try {
      const result = await axios.get(
        `${apiUrls}/api/messages?userbread=${userbread}`
      );
      const response = result.data;
      setMessages(response);
      const expiry = {};
      messages.forEach((msg) => {
        const requestTime = new Date(msg.timestamp);
        const expiryTime = new Date(requestTime.getTime() + 10 * 60 * 1000);
        if (expiryTime < new Date()) {
          expiry[msg.id] = true; // Mark as expired if current time exceeds expiry time
        }
      });
      setExpired(expiry);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchData2 = async (page, searchQuery) => {
    try {
      const response = await axios.get(`${apiUrls}/api/profile`, {
        params: {
          page: page + 1,
          pageSize: usersPerPage,
          search: searchQuery,
          viewMode: viewMode, // Pass the search query to the backend
        },
      });
      console.log(response);
      const { buysells: newBuysells, totalPages: newTotalPages } =
        response.data;
      setbuysells(newBuysells);
      const initialStatus = {};
      newBuysells.forEach((item) => {
        initialStatus[item.id] = item.status;
      });
      await fetchSettingStatus(userbread);
      setButtonStatus(initialStatus);
      setTotalPages(newTotalPages);
      setUserIn(userbread);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async (page) => {
    try {
      const response = await axios.get(`http://localhost:4000/profileapi`);
      const profile = response.data;

      const response2 = await axios.get(
        `${apiUrls}/api/messages?userbread=${userbread}`
      );
      const fullMessage = response2.data;
      setMessages(fullMessage);

      const expiry = {};
      fullMessage.forEach((msg) => {
        const requestTime = new Date(msg.timestamp);
        const expiryTime = new Date(requestTime.getTime() + 10 * 60 * 1000);
        if (expiryTime < new Date()) {
          expiry[msg.id] = true; // Mark as expired if current time exceeds expiry time
        }
      });
      setExpired(expiry);

      setProfile(profile);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData(profile);
  }, []);

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

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
      if (
        settings &&
        settings.toggle_status &&
        settings.toggle_status.buysell
      ) {
        const toggleStatus = settings.toggle_status.buysell;
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

  useEffect(() => {
    fetchData(pageNumber, searchQuery);
  }, [pageNumber, searchQuery]);

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
  const handleEditClick = (buysell) => {
    console.log("buysell", buysell);
    setEditData({
      name: buysell.name,
      description: buysell.description,
      price: buysell.formatted_price,
      location: buysell.location,
    });
    setItemId(buysell.id);

    console.log("editdata", editData);
  };

  const handleDeleteItem = async () => {
    setIsPopupVisible(false);
    setbuysells((prevBuysells) =>
      prevBuysells.filter((buysell) => buysell.id !== itemToDelete)
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

  const confirmConnect = async (messageId, orderId) => {
    try {
      await axios.post(
        `${apiUrls}/api/confirm-connect`,
        {
          messageId,
          orderId,
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      setAcceptedMessages((prevAccepted) => [...prevAccepted, messageId]); // Add messageId to acceptedMessages array
      setCountdownEndTime((prevEndTime) => ({
        ...prevEndTime,
        [messageId]: new Date(new Date().getTime() + 30 * 60 * 1000), // Set individual countdowns for each message
      }));
      setExpired((prev) => ({ ...prev, [messageId]: true })); // Mark as expired after confirming
    } catch (error) {
      console.error("Error confirming connect:", error);
    }
  };

  const rejectConnect = async (messageId, orderId) => {
    try {
      await axios.post(`${apiUrls}/api/reject-connect`, {
        messageId,
        orderId,
      });
      // Remove the rejected message from the state
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      );
    } catch (error) {
      console.error("Error rejecting connect:", error);
    }
  };

  const handleEditSubmit = async (event) => {
    console.log("edit submitt", editData.name);
    event.preventDefault();
    try {
      const formData = new FormData();

      // Append other data fields to FormData
      formData.append("name", editData.name);
      formData.append("description", editData.description);
      formData.append("price", editData.price);
      formData.append("location", editData.location);

      console.log("form Submitted", formData);

      // Append the file only if a new one is selected
      if (selectedFile) {
        formData.append("file", selectedFile); // Add the new file to the FormData
      }

      // Send the FormData to the server using a PUT request
      await axios.put(
        `${apiUrls}/api/edit-upload/${itemId}`,
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

  function createCard(messages) {
    const isFlipped = flippedCards[messages.id];
    const requestTime = new Date(messages.timestamp);
    const expiryTime = new Date(requestTime.getTime() + 10 * 60 * 1000);
    const expiryTime2 = new Date(requestTime.getTime() + 10 * 60 * 3000);
    const isExpired = new Date() > expiryTime;
    const isExpired2 = new Date() > expiryTime;

    const isAccepted = acceptedMessages.includes(messages.id); // Check if this message is accepted

    return (
      <div className={`cardProfile ${isFlipped ? "flipped" : ""}`}>
        <div className={`card-inner ${isFlipped ? "flippedCard" : ""}`}>
          {isFlipped ? (
            <div>
              <h2 className="INFO text-gradient">Info</h2>
              <BsXLg
                className="text-gradient cardIconFlip3"
                onClick={() => handleFlip(messages.id)}
              />

              <p>
                <strong> ID: </strong>
                {messages.id}
                <hr />
                <br />
                <strong> AGENT TYPE:</strong> {messages.type}
                <hr />
                <br />
                <strong> CUSTOMER NAME: </strong> {messages.sender_fullname}
                <hr />
                <br />
                <strong> USER ID: </strong> {messages.sender_id}
                <hr />
                <br />
                <strong> ORDER CODE : </strong> {messages.order_code}
                <hr />
                <br />
                <a className="reportUser" href="#">
                  Report User?
                </a>
                <hr />
              </p>
            </div>
          ) : (
            <div key={messages.id}>
              {isAccepted || messages.message === "connect accepted" ? (
                <ul className="roommate-list-head">
                  <li>
                    <div className="profilePicProfile">
                      <div className="profileHeaderR bg-blue-gradient">
                        <p className="profileInfo">Connect Accepted</p>

                        <BsInfoCircleFill
                          className="text-gradient  text-gradient cardIconFlip"
                          onClick={() => handleFlip(messages.id)}
                        />
                      </div>
                      <BsPeopleFill className="connectProfile" />
                    </div>
                  </li>
                  <li className="roommateList">
                    BY : {messages.sender_fullname}
                  </li>
                  <hr />
                  <li className="roommateList">ON : {messages.timestamp}</li>
                  <hr />
                  <li className="roommateList">
                    TYPE : {capitalizeFirstLetter(messages.type)}
                  </li>
                  <li className="chat-call-buttons">
                    <button
                      className="bg-blue-gradient roommate-button connect-accept-button-chat"
                      disabled={isExpired || isAccepted}
                    >
                      <BsPatchCheckFill className="connect_icon" />
                      Call
                    </button>
                    <button
                      className="bg-blue-gradient roommate-button connect-accept-button-chat"
                      disabled={isExpired || isAccepted}
                    >
                      <BsXOctagonFill className="connect_icon" />
                      Chat
                    </button>
                    <p className="text-gradient">
                      <CountdownTimer endTime={expiryTime2} />
                    </p>
                  </li>
                </ul>
              ) : (
                <ul className="roommate-list-head">
                  <li>
                    <div className="profilePicProfile">
                      <div className="profileHeaderR bg-blue-gradient">
                        <p className="profileInfo">{messages.message}</p>
                        <BsInfoCircleFill
                          className="text-gradient  text-gradient cardIconFlip"
                          onClick={() => handleFlip(messages.id)}
                        />
                      </div>
                      <BsPeopleFill className="connectProfile" />
                    </div>
                  </li>
                  <li className="roommateList">
                    BY : {messages.sender_fullname}
                  </li>
                  <hr />
                  <li className="roommateList">ON : {messages.timestamp}</li>
                  <hr />
                  <li className="roommateList">
                    TYPE : {capitalizeFirstLetter(messages.type)}
                  </li>
                  <li className="chat-call-buttons">
                    <button
                      onClick={() =>
                        confirmConnect(messages.id, messages.order_code)
                      }
                      className="bg-blue-gradient roommate-button connect-accept-button-chat"
                      disabled={isExpired || isAccepted}
                    >
                      <BsPatchCheckFill className="connect_icon" />
                      Confirm
                    </button>
                    <button
                      onClick={() => rejectConnect(messages.id)}
                      className="bg-blue-gradient roommate-button connect-accept-button"
                    >
                      <BsXOctagonFill className="connect_icon" />
                      Reject
                    </button>
                  </li>
                  <p className="text-gradient">
                    <CountdownTimer endTime={expiryTime} />
                  </p>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const filteredMessages = buysells.filter((buysell) => {
    if (viewMode === "general") {
      return buysell.status === "available";
    }
    return true; // Show all items in profile view
  });

  // const displayUsers2 = filteredBuysells
  //   .filter((buysell) =>
  //     selectedAgent ? buysell.fk_user_id === selectedAgent : true
  //   )
  //   .map(createCard);

  const displayUsers = messages.map(createCard);

  return (
    <main className="main-container">
      <div className="mainTitle">
        <div className="dropdown-container">
          <select
            id="component-select"
            onChange={handleComponentChange}
            value={selectedComponent} // Bind the dropdown to the state
          >
            <option value="Profile">Connects</option>
            <option value="Lodge">Buysell Items</option>
            <option value="Lodge">Lodges</option>
            <option value="Lodge">Agents</option>
          </select>
        </div>

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

        {/* <p onClick={all} className="buysellAll text-gradient">
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
        </p> */}
        <h3 className="text-gradient">CONNECTS</h3>
      </div>

      {messages.length === 0 ? (
        <div className="noItems ">
          <p>Oops!! No Connects displayed 🥹</p>
        </div>
      ) : (
        <LazyLoadComponent>
          <div className="main-cards-roommates">{displayUsers}</div>
        </LazyLoadComponent>
      )}

      <div className="agent-footer">
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
