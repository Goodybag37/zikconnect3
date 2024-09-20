import React, { useEffect, useState, useContext } from "react";
import {
  BsFillBellFill,
  BsFillEnvelopeFill,
  BsPersonCircle,
  BsFillPersonXFill,
  BsBriefcaseFill,
  BsEyedropper,
  BsJustify,
} from "react-icons/bs";
import axios from "axios";
import { Link } from "react-router-dom";
import AuthContext from "../AuthContext";
// import { io } from "socket.io-client"; // WebSocket client
import {
  BsPatchCheckFill,
  BsFillPersonFill,
  BsFillTelephoneFill,
  BsXOctagonFill,
} from "react-icons/bs";
import CountdownTimer from "../components/Countdowntimer";

function Header(props) {
  const { OpenSidebar, heading } = props;

  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [acceptedMessages, setAcceptedMessages] = useState([]); // Array to track accepted message IDs
  const [countdownEndTime, setCountdownEndTime] = useState({});
  const [expired, setExpired] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL; // Track expiry of messages

  const userbread = user.userId; // Optional chaining to avoid errors if user is null

  const handleMessages = async () => {
    setShowMessages(!showMessages);
    try {
      const result = await axios.get(
        `${apiUrl}/api/messages?userbread=${userbread}`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const response = result.data;
      setMessages(response);
      const expiry = {};
      response.forEach((msg) => {
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

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
  };

  const confirmConnect = async (messageId, orderId) => {
    try {
      await axios.post(
        `${apiUrl}/api/confirm-connect`,
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

  const signout = () => {
    logout();
  };

  const rejectConnect = async (messageId, orderId) => {
    try {
      await axios.post(`${apiUrl}/api/reject-connect`, {
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

  // useEffect(() => {
  //   const socket = io("${apiUrl}/api");
  //   // Call to handle existing messages if needed on initial render

  //   // Listen for the "newMessage" event and update messages in real-time
  //   socket.on("newMessage", (newMessage) => {
  //     setMessages((prevMessages) => [...prevMessages, newMessage]);
  //   });

  //   // Cleanup function to remove the socket listener
  //   return () => {
  //     socket.off("newMessage");
  //   };
  // }, []);

  return (
    <header className="header">
      <div className="menu-icon">
        <BsJustify className="icon" onClick={OpenSidebar} />
      </div>
      <div className="header-left"></div>
      <div className="text-gradient agent-title">{heading}</div>
      <div className="header-right">
        <BsFillBellFill className="icon-bell" />
        <BsFillEnvelopeFill onClick={() => handleMessages()} className="icon" />
        <BsPersonCircle onClick={handleProfileClick} className="icon" />
      </div>

      {showMessages && (
        <div className="message-popup">
          {messages.map((msg) => {
            const requestTime = new Date(msg.timestamp);
            const expiryTime = new Date(requestTime.getTime() + 10 * 60 * 1000);
            const expiryTime2 = new Date(
              requestTime.getTime() + 10 * 60 * 3000
            );
            const isExpired = new Date() > expiryTime;
            const isExpired2 = new Date() > expiryTime;

            const isAccepted = acceptedMessages.includes(msg.id); // Check if this message is accepted

            return (
              <div key={msg.id} className={`message-card ${msg.type}`}>
                {isAccepted ? (
                  <div className="card bg-discount-gradient">
                    <div>
                      <h1 className="text-gradient connectHeadingMessage">
                        Connect Accepted
                      </h1>
                      <p className="text-gradient">
                        <CountdownTimer endTime={countdownEndTime[msg.id]} />
                      </p>
                      <ul>
                        <li>Connect Type: {msg.type}</li>
                        <br />
                        <li>Order No: {msg.order_code}</li>
                        <br />
                        <li>
                          Sender: User({msg.sender_id}) {msg.sender_fullname}
                        </li>
                        <br />
                      </ul>
                    </div>
                    <div className="chat-call-buttons">
                      <button
                        disabled={isExpired2}
                        className="bg-blue-gradient roommate-button connect-accept-button-chat"
                      >
                        Chat
                      </button>
                      <button
                        disabled={isExpired2}
                        className="bg-blue-gradient roommate-button connect-accept-button"
                      >
                        Call
                      </button>
                    </div>

                    {isExpired2 && <p className="text-red">Connect Expired</p>}
                  </div>
                ) : (
                  msg.message === "connect request" && (
                    <div className="card bg-discount-gradient">
                      <div>
                        <h1 className="text-gradient connectHeadingMessage">
                          Connect Request
                        </h1>
                        <p>
                          {requestTime
                            .toISOString()
                            .slice(0, 19)
                            .replace("T", " ")}
                        </p>
                        <p className="text-gradient">
                          <CountdownTimer endTime={expiryTime} />
                        </p>
                        <ul>
                          <li>Connect Type: {msg.type}</li>
                          <br />
                          <li>Order No: {msg.order_code}</li>
                          <br />
                          <li>
                            Sender: User({msg.sender_id}) {msg.sender_fullname}
                          </li>
                          <br />
                        </ul>
                      </div>
                      <div className="chat-call-buttons">
                        <button
                          onClick={() => confirmConnect(msg.id, msg.order_code)}
                          className="bg-blue-gradient roommate-button connect-accept-button-chat"
                          disabled={isExpired || isAccepted}
                        >
                          <BsPatchCheckFill className="connect_icon" />
                          Confirm
                        </button>
                        <button
                          onClick={() => rejectConnect(msg.id)}
                          className="bg-blue-gradient roommate-button connect-accept-button"
                        >
                          <BsXOctagonFill className="connect_icon" />
                          Reject
                        </button>
                      </div>
                      {isExpired && <p className="text-red">Connect Expired</p>}
                    </div>
                  )
                )}
                {msg.message === "connect accepted" && (
                  <div className="card bg-discount-gradient">
                    <div>
                      <h1 className="text-gradient connectHeadingMessage">
                        Connect Accepted
                      </h1>
                      <p>
                        {requestTime
                          .toISOString()
                          .slice(0, 19)
                          .replace("T", " ")}
                      </p>
                      <p className="text-gradient">
                        <CountdownTimer endTime={expiryTime2} />
                      </p>
                      <ul>
                        <li>Connect Type: {msg.type}</li>
                        <br />
                        <li>Order No: {msg.order_code}</li>
                        <br />
                        <li>
                          Sender: User({msg.sender_id}) {msg.sender_fullname}
                        </li>
                        <br />
                      </ul>
                    </div>
                    <div className="chat-call-buttons">
                      <button
                        disabled={isExpired2}
                        className="bg-blue-gradient roommate-button connect-accept-button-chat"
                      >
                        Chat
                      </button>
                      <button
                        disabled={isExpired2}
                        className="bg-blue-gradient roommate-button connect-accept-button"
                      >
                        Call
                      </button>
                    </div>
                    {isExpired2 && <p className="text-red">Connect Expired</p>}
                  </div>
                )}
                {msg.type === "error" && (
                  <button className="btn-error">Error Action</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showProfile && (
        <div className="profile-popup bg-black-gradient">
          <h3 className="profile-head text-gradient">{user.full_name}</h3>
          <hr />
          <br />
          <p className="profileParagraph">
            <BsFillPersonFill /> <strong>User: </strong> {user.id}
          </p>
          <br></br>
          <p className="profileParagraph">
            <BsBriefcaseFill />
            <strong>Email: </strong> {user.email}
          </p>
          <br />
          <p className="profileParagraph">
            <BsFillTelephoneFill />
            <strong>Phone: </strong> {user.phone}
            <Link className="editPhone" to="/verifyphone">
              <BsEyedropper />
            </Link>
          </p>
          <br />
          <hr />
          <br />
          <button
            onClick={() => {
              signout();
            }}
            className="signout-button profileParagraph text-gradient"
          >
            {" "}
            <BsFillPersonXFill />
            SIGN OUT
          </button>
          <br />
          {/* Add more user details here */}
        </div>
      )}
    </header>
  );
}

export default Header;
