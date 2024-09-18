import React, { useEffect, useState, useContext } from "react";
import {
  BsFillBellFill,
  BsFillEnvelopeFill,
  BsPersonCircle,
  BsJustify,
} from "react-icons/bs";
import axios from "axios";
import AuthContext from "../AuthContext";
import { io } from "socket.io-client"; // WebSocket client
import { BsPatchCheckFill, BsXOctagonFill } from "react-icons/bs";
import CountdownTimer from "../components/Countdowntimer";

const socket = io("http://localhost:4000");

function Header(props) {
  const { OpenSidebar, heading } = props;

  const { isAuthenticated, user } = useContext(AuthContext);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [accepted, setAccepted] = useState(null);
  const [countdownEndTime, setCountdownEndTime] = useState(null);

  const userbread = user.userId; // Optional chaining to avoid errors if user is null

  const handleMessages = async () => {
    setShowMessages(!showMessages);
    try {
      const result = await axios.get(
        `http://localhost:4000/messages?userbread=${userbread}`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const response = result.data;
      setMessages(response);
    } catch (error) {}
  };

  const confirmConnect = (messageId) => {
    setAccepted(messageId);
    // Set countdown timer to 30 minutes from now
    setCountdownEndTime(new Date(new Date().getTime() + 30 * 60 * 1000));
  };

  const rejectConnect = () => {
    // Handle rejection logic here
    console.log("Connect request rejected");
  };

  useEffect(() => {
    // Fetch data from your API on initial render
    // Listen for new messages via WebSocket
    socket.on("newMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Cleanup WebSocket connection when component unmounts
    return () => {
      socket.off("newMessage");
    };
  }, []);

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
        <BsPersonCircle className="icon" />
      </div>

      {showMessages && (
        <div className="message-popup">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-card ${msg.type}`}>
              {accepted === msg.id ? (
                <div className="card bg-discount-gradient">
                  <div>
                    <h1 className="text-gradient connectHeadingMessage">
                      Connect Accepted
                    </h1>
                    <p className="text-gradient">
                      <CountdownTimer endTime={countdownEndTime} />
                    </p>
                    <ul>
                      <li> Connect Type: {msg.type}</li>
                      <br />
                      <li>Order No: {msg.order_code}</li>
                      <br />
                      <li>
                        {" "}
                        Sender: User({msg.sender_id}) {msg.sender_fullname}
                      </li>
                      <br />
                    </ul>
                  </div>
                  <div className="chat-call-buttons">
                    <button className="bg-blue-gradient roommate-button connect-accept-button-chat">
                      Chat
                    </button>
                    <button className="bg-blue-gradient roommate-button connect-accept-button">
                      Call
                    </button>
                  </div>
                </div>
              ) : (
                msg.message === "connect request" && (
                  <div className="card bg-discount-gradient">
                    <div>
                      <h1 className="text-gradient connectHeadingMessage">
                        Connect Request
                      </h1>
                      <p>
                        {new Date(msg.timestamp)
                          .toISOString()
                          .slice(0, 19)
                          .replace("T", " ")}
                      </p>
                      <p className="text-gradient">
                        <CountdownTimer
                          endTime={
                            new Date(
                              new Date(msg.timestamp).getTime() + 10 * 60 * 1000
                            )
                          }
                        />
                      </p>
                      <ul>
                        <li> Connect Type: {msg.type}</li>
                        <br />
                        <li>Order No: {msg.order_code}</li>
                        <br />
                        <li>
                          {" "}
                          Sender: User({msg.sender_id}) {msg.sender_fullname}
                        </li>
                        <br />
                      </ul>
                    </div>
                    <div className="chat-call-buttons">
                      <button
                        onClick={() => confirmConnect(msg.id)}
                        className="bg-blue-gradient roommate-button connect-accept-button-chat"
                      >
                        <BsPatchCheckFill className="connect_icon" />
                        Confirm
                      </button>
                      <button
                        onClick={() => rejectConnect()}
                        className="bg-blue-gradient roommate-button connect-accept-button"
                      >
                        <BsXOctagonFill className="connect_icon" />
                        Reject
                      </button>
                    </div>
                  </div>
                )
              )}
              {msg.type === "warning" && (
                <button className="btn-warning">Warning Action</button>
              )}
              {msg.type === "error" && (
                <button className="btn-error">Error Action</button>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

export default Header;
