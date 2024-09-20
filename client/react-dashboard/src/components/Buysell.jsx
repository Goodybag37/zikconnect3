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
import { BsZoomIn, BsBrowserEdge, BsFillPersonXFill } from "react-icons/bs";
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

// const socket = io("${apiUrl}/api");

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

  const apiUrl = process.env.REACT_APP_API_URL;
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
  const [askToggle, setAskToggle] = useState(true); // "general" or "profile"

  const maxLength = 250;
  const maxLengthN = 20;
  const maxLengthD = 200;
  const maxLengthL = 25;
  const maxLengthP = 15;

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
      const response = await axios.get(`${apiUrl}/api/buysellapi`, {
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

  const handleCheckboxChange = async (event) => {
    if (event.target.checked) {
      setAskToggle(false);

      try {
        // Determine the new status based on the current state

        // Send a POST request to update the status in the database
        await axios.post(
          `${apiUrl}/api/preference-toggleask/`,
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
      const response = await axios.get(`${apiUrl}/api/get-status/${userId}`, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

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

  const handleToggleClick = async () => {
    setIsPopupVisible2(true);
    try {
      // Determine the new status based on the current state
      const newStatus = toggled === true ? "unavailable" : "available";
      const type = "buysell";

      // Send a POST request to update the status in the database
      await axios.post(
        `${apiUrl}/api/update-status/${type}`,
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
    try {
      // Optimistically update the button for the current user
      setButtonStatus((prevState) => ({
        ...prevState,
        [itemId]: "in order",
      }));

      // Send the connect request to the backend
      await axios.post(
        `${apiUrl}/api/connectbuysell`,
        { itemId },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      // The backend will broadcast the update to all connected users
    } catch (error) {
      console.error("Error connecting:", error);
    }
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
      const response = await axios.get(`${apiUrl}/api/buysell/${itemId}`, {
        responseType: "blob", // Important: Fetch the image as a Blob
        validateStatus: (status) => status < 500,
      });
      if (response.status === 404) {
        // Check if the Blob is empty, indicating no image was found
        setModalContent(
          <div>
            <p>No image found for this item.</p>
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
      await axios.post(`${apiUrl}/api/delete-upload/${itemToDelete}`, {
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
        `${apiUrl}/api/edit-upload/${itemId}`,
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

  function createCard(buysell) {
    const isFlipped = flippedCards[buysell.id];

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
                onClick={() => handleFlip(buysell.id)}
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
                  placeholder={buysell.original_name}
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
            <div key={buysell.id}>
              <ul className="roommate-list-head">
                <li>
                  <div className="profilePicRoommate">
                    <div className="profileHeaderR bg-blue-gradient">
                      <p className="profileInfo">{buysell.name}</p>
                    </div>
                    <p className="profile-body">
                      {buysell.description} <br />
                      <hr />
                      Price: {buysell.formatted_price}
                    </p>
                  </div>
                </li>

                <li className="roommateList">At : {buysell.location} </li>
                <hr />
                <li className="roommateList">On : {buysell.formatted_date}</li>
                <hr />
                <li className="roommateList">By : {buysell.seller_name}</li>
                <li className="roommate-list">
                  <button
                    className="bg-blue-gradient roommateButtonConnect"
                    disabled={
                      buttonStatus[buysell.id] === "in order" ||
                      selectedAgent ||
                      buysell.fk_user_id === userIn
                    }
                    onClick={() => handleConnectClick(buysell.id)}
                  >
                    {buttonStatus[buysell.id] === "order"
                      ? "In Order..."
                      : "Connect"}
                  </button>

                  <button
                    onClick={() => handleShowPicture(buysell.id)}
                    className="roommateButtonPicture "
                  >
                    <BsPeopleFill className="connect_icon" />
                    See Picture
                  </button>
                  {selectedAgent && (
                    <BsArchiveFill
                      className="text-gradient cardIconDelete"
                      onClick={() => {
                        handleDeleteClick(buysell.id);
                      }}
                    />
                  )}

                  {selectedAgent && (
                    <BsEyedropper
                      className="text-gradient cardIconFlip2"
                      onClick={() => {
                        handleEditClick(buysell);
                        handleFlip(buysell.id);
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

  const filteredBuysells = buysells.filter((buysell) => {
    if (viewMode === "general") {
      return buysell.status === "available";
    }
    return true; // Show all items in profile view
  });

  const displayUsers = filteredBuysells
    .filter((buysell) =>
      selectedAgent ? buysell.fk_user_id === selectedAgent : true
    )
    .map(createCard);

  const displayUsers2 = filteredBuysells.map(createCard);

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

      {filteredBuysells.length === 0 ? (
        <div className="noItems ">
          <p>Oops!! No properties displayed 🥹</p>
        </div>
      ) : (
        <LazyLoadComponent>
          <div className="main-cards-roommates">{displayUsers}</div>
        </LazyLoadComponent>
      )}

      <div className="agent-footer">
        <Link to="/uploadproperty">
          <button className="agent-button">
            <BsFileEarmarkPerson className="card_icon" />
            Upload Property
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
            { label: "Confirm", onClick: handleDeleteItem },
            { label: "Cancel", onClick: cancelDelete },
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
            { label: "Confirm", onClick: () => setIsPopupVisible2(false) }, // Fix here
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
