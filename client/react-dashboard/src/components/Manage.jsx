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
import { BsPeopleFill, BsXLg } from "react-icons/bs";

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
  const [isPopupVisible3, setIsPopupVisible3] = useState(false);
  const [declined, setDeclined] = useState();
  const [approved, setApproved] = useState();
  const [confirming, setConfirming] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    price: "",
    location: "",
  });

  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;

  const { isAuthenticated, user, login } = useContext(AuthContext);
  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId;

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [itemToDelete, setItemToDelete] = useState(null);
  const [toggled, setToggled] = useState(true);
  const [viewMode, setViewMode] = useState("general");
  const [askToggle, setAskToggle] = useState(true);
  const [profile, setProfile] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState("Profile");

  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [acceptedMessages, setAcceptedMessages] = useState([]);

  const apiUrls = process.env.REACT_APP_API_URL;
  const apiUrl = "http://localhost:4000";

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${apiUrls}/api/agent-management?user=${userbread}`
      );
      setMessages(response.data.approval);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userbread]);

  useEffect(() => {
    fetchData();
  }, [pageNumber, searchQuery]);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const cancelDelete = () => {
    setIsPopupVisible(false);
    setItemToDelete(null);
  };

  const approveAgent = async (messageId, orderId) => {
    const decision = "approved";

    try {
      await axios.post(
        `${apiUrls}/api/respond-to-agent`,
        { messageId, decision },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      setIsPopupVisible3(false);
      setConfirming(false);
    } catch (error) {
      console.error("Error confirming connect:", error);
    }
  };

  const declineAgent = async (messageId) => {
    const decision = "declined";

    try {
      await axios.post(`${apiUrls}/api/respond-to-agent`, {
        messageId,
        decision,
      });
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      );
      setIsPopupVisible2(false);
      setConfirming(false);
    } catch (error) {
      console.error("Error rejecting connect:", error);
    }
  };

  const createCard = (messages) => {
    const isFlipped = flippedCards[messages.id];
    const isAccepted = acceptedMessages.includes(messages.id);

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
                <strong>ID:</strong> {messages.id}
                <hr />
                <strong>USER FULL NAME:</strong> {messages.fullname}
                <hr />
                <strong>USER ID:</strong> {messages.user_id}
                <hr />
                <strong>USER Email:</strong> {messages.email}
                <hr />
                <strong>Gps Location:</strong> {messages.formatted_location}
                <hr />
                <strong>Status:</strong> {messages.status}
              </p>
              <a href={`tel:${messages.call}`}>
                <button className="bg-blue-gradient roommate-button connect-accept-button-chat">
                  <BsPatchCheckFill className="connect_icon" />
                  Call
                </button>
              </a>

              <a
                href={`https://wa.me/${messages.whatsapp.replace(
                  /[\s+]/g,
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-blue-gradient roommate-button connect-accept-button-chat">
                  <BsXOctagonFill className="connect_icon" />
                  Chat
                </button>
              </a>
            </div>
          ) : (
            <div className="agent-inner">
              <h2>User Details</h2>
              <BsInfoCircleFill
                className="text-gradient cardIconFlip"
                onClick={() => handleFlip(messages.id)}
              />
              <p>
                <strong>NAME:</strong> {messages.fullname}
                <hr />
                <strong>TYPE:</strong> {messages.type}
                <hr />
                <strong>LOCATED:</strong> {messages.located}
                <hr />
                <strong>DESCRIPTION:</strong> {messages.description}
                <hr />
                <button
                  onClick={() => {
                    setApproved(messages.id);
                    setIsPopupVisible3(true);

                    // declineAgent(messages.id)}}
                  }}
                  className="bg-blue-gradient roommate-button connect-accept-button-chat"
                  disabled={
                    !messages.status ||
                    messages.status === "approved" ||
                    messages.status === "declined"
                  }
                >
                  <BsPatchCheckFill className="connect_icon" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    setDeclined(messages.id);
                    setIsPopupVisible2(true);
                    // declineAgent(messages.id)}}
                  }}
                  className="bg-blue-gradient roommate-button connect-accept-button"
                  disabled={
                    !messages.status ||
                    messages.status === "approved" ||
                    messages.status === "declined"
                  }
                >
                  <BsXOctagonFill className="connect_icon" />
                  Decline
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const displayUsers = Array.isArray(messages)
    ? messages.map(createCard)
    : null;

  return (
    <main className="main-container">
      <div className="mainTitle">
        <h3 className="text-gradient">Manage Agents</h3>
      </div>

      {messages.length === 0 ? (
        <div className="noItems">
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
              activeClassName={"paginationActive"}
            />
          </div>
        )}
      </div>
      {isPopupVisible2 && (
        <Popup
          header="Decline Agent"
          message="Are you sure you want to decline this agent?"
          buttons={[
            {
              label: (
                <>
                  <BsPatchCheckFill className="connect_icon" />{" "}
                  {confirming ? "Declined" : "Confirm"}
                </>
              ),
              onClick: () => {
                setConfirming(true);
                declineAgent(declined);
              }, // Fix: Wrap in an arrow function
            },
            {
              label: (
                <>
                  <BsXOctagonFill className="connect_icon" /> Cancel
                </>
              ),
              onClick: () => setIsPopupVisible2(false), // Fix: Wrap in an arrow function
            },
          ]}
        />
      )}

      {isPopupVisible3 && (
        <Popup
          header="Approve Agent"
          message="Are you sure you want to approve this agent? "
          buttons={[
            {
              label: (
                <>
                  <BsPatchCheckFill className="connect_icon" />{" "}
                  {confirming ? "Approved" : "Confirm"}
                </>
              ),
              onClick: () => {
                setConfirming(true);
                approveAgent(approved);
              },
            },
            {
              label: (
                <>
                  <BsXOctagonFill className="connect_icon" /> Cancel
                </>
              ),
              onClick: () => setIsPopupVisible3(false),
            },
          ]}
        />
      )}

      {isPopupVisible && (
        <Popup onClose={cancelDelete} onConfirm={handleDeleteItem} />
      )}
    </main>
  );
}

export default YourComponent;
