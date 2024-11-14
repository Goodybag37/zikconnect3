import React, { useEffect, useState, useContext } from "react";
import {
  BsFillBellFill,
  BsFillEnvelopeFill,
  BsPersonCircle,
  BsFillPersonXFill,
  BsBriefcaseFill,
  BsEyedropper,
  BsJustify,
  BsFillPlusSquareFill,
  BsCashCoin,
} from "react-icons/bs";
import axios from "axios";
import { FaRegCopy } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthContext from "../AuthContext";
import { io } from "socket.io-client"; // Optional chaining to avoid errors if user is null

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
  const [unread, setUnread] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const apiUrls = process.env.REACT_APP_API_URL;
  const [profile, setProfile] = useState([]); // Track expiry of messages
  const apiUrl = "http://localhost:4000";
  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId;

  const [copied, setCopied] = useState(false);
  const textToCopy = `https://zikconnect.com?ref_code=${profile.settings_referral_code}`; // Text to be copied

  // const socket = io(apiUrls);
  const handleMessages = async () => {
    setShowMessages(!showMessages);
    try {
      const result = await axios.get(
        `${apiUrls}/api/messages?userbread=${userbread}&reset=true`
      );
      const { messages, unreadCount } = result.data;

      setMessages(messages); // Set the messages state
      setUnread(unreadCount); // Set the unread count state

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

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  // const fetchData = async () => {
  //   try {
  //     const result = await axios.get(
  //       `${apiUrls}/api/messages?userbread=${userbread}&reset=false`
  //     );

  //     const { messages, unreadCount } = result.data;
  //     setMessages(messages);
  //     setUnread(unreadCount);

  //     const expiry = {};
  //     messages.forEach((msg) => {
  //       const requestTime = new Date(msg.timestamp);
  //       const expiryTime = new Date(requestTime.getTime() + 10 * 60 * 1000);
  //       if (expiryTime < new Date()) {
  //         expiry[msg.id] = true; // Mark as expired if current time exceeds expiry time
  //       }
  //     });
  //     setExpired(expiry);
  //   } catch (error) {
  //     console.error("Error fetching messages:", error);
  //   }
  // };

  // const fetchData = async () => {
  //   try {
  //     const result = await axios.get(
  //       `${apiUrls}/api/messages?userbread=${userbread}&reset=false`
  //     );

  //     const { messages, unreadCount } = result.data;
  //     setMessages(messages);
  //     setUnread(unreadCount);

  //     const expiry = {};
  //     messages.forEach((msg) => {
  //       const requestTime = new Date(msg.timestamp);
  //       const expiryTime = new Date(requestTime.getTime() + 10 * 60 * 1000);
  //       if (expiryTime < new Date()) {
  //         expiry[msg.id] = true; // Mark as expired if current time exceeds expiry time
  //       }
  //     });
  //     setExpired(expiry);
  //   } catch (error) {
  //     console.error("Error fetching messages:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  const fetchData = async () => {
    try {
      const result = await axios.get(
        `${apiUrls}/api/messages?userbread=${userbread}&reset=false`
      );

      const response2 = await axios.get(
        `${apiUrls}/api/profile?userbread=${userbread}`
      );

      const profiles = response2.data;
      console.log("profile is ", profiles);
      setProfile(profiles);
      const { messages, unreadCount } = result.data;

      console.log("result is", unreadCount);
      setMessages(messages);
      setUnread(unreadCount);

      const expiry = {};
      messages.forEach((msg) => {
        const requestTime = new Date(msg.timestamp);
        const expiryTime = new Date(requestTime.getTime() + 10 * 60 * 1000);
        if (expiryTime < new Date()) {
          expiry[msg.id] = true;
        }
      });
      setExpired(expiry);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (userbread) {
      fetchData();
    }
  }, [userbread]); // Ensure fetchData runs when userbread changes

  // useEffect(() => {
  //   // Fetch data when the component mounts
  //   fetchData();

  //   // Cleanup function if you need to clear any states or intervals on unmount
  //   return () => {
  //     // Add any cleanup logic if necessary
  //     // e.g., resetting states, clearing timers, etc.
  //     setMessages([]);
  //     setUnread(0);
  //     setExpired({});
  //   };
  // }, []); // Dependencies array

  // useEffect(() => {
  //   const socket = io(apiUrls); // Connect to the WebSocket server
  //   socket.on("connect", () => {
  //     console.log("Connected to WebSocket server with ID:", socket.id);
  //   });

  //   if (userbread) {
  //     // Join the room specific to the user
  //     socket.emit("joinRoom", userbread);

  // Listen for new message events
  // socket.on("newMessages", (data) => {
  //   setMessages(data.messages); // Update messages
  //   setUnread(data.unreadCount); // Update unread count
  //   setUpdateCount((prev) => prev + 1); // Force re-render
  // });
  // }

  //   fetchData(); // Fetch initial messages

  //   return () => {
  //     // Clean up the WebSocket connection on component unmount
  //     socket.disconnect();
  //   };
  // }, [userbread]);

  // useEffect(() => {
  //   socket.on("connect", () => {
  //     console.log("Connected to WebSocket server with ID:", socket.id);
  //   });

  //   socket.on("message", (data) => {
  //     console.log("Message received from server:", data); // Should log "hello"
  //   });
  //   socket.on("newMessages", (data) => {
  //     setMessages(data.messages); // Update messages
  //     setUnread(data.unreadCount); // Update unread count
  //     setUpdateCount((prev) => prev + 1); // Force re-render
  //     console.log("Message received from server:", data);
  //   });

  //   socket.on("disconnect", () => {
  //     console.log("Disconnected from WebSocket server");
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
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

  const signout = () => {
    logout();
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

  // useEffect(() => {
  //   const socket = io("${apiUrls}/api");
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
        <p className="unread">
          <strong>{unread} </strong>
        </p>
        <BsFillBellFill className={unread > 0 ? "icon-bell" : "icon"} />

        <BsFillEnvelopeFill
          onClick={() => handleMessages()}
          className={
            unread > 0 ? "icon iconBlack iconCursor" : "icon iconCursor"
          }
        />
        <BsPersonCircle
          onClick={handleProfileClick}
          className="icon iconCursor"
        />
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
                {msg.message === "connect accepted" ? (
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
                      </div>
                      {!isExpired && (
                        <Link className="iconCursor iconPink" to="/profiles">
                          See
                        </Link>
                      )}
                      {isExpired && <p className="text-red">Connect Expired</p>}
                    </div>
                  )
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
          <p className="profileParagraph text-gradient">{user.email}</p>
          <br />
          <hr />
          <br />
          <p className="profileParagraph">
            <BsFillPersonFill /> <strong>User: </strong> {user.id}
          </p>
          <br></br>
          <p className="profileParagraph">
            <BsFillPersonFill /> <strong>Referral Code: </strong>{" "}
            {profile.settings_referral_code}
            <FaRegCopy onClick={handleCopy} style={{ cursor: "pointer" }} />
            {copied == true ? <p className="copyCode">copied</p> : ""}
          </p>

          <br></br>

          <p className="profileParagraph">
            <BsFillTelephoneFill />
            <strong>Phone: </strong> {user.isPhoneVerified}
            <Link className="editPhone" to="/verifyphone">
              <BsEyedropper />
            </Link>
          </p>

          <br />

          <p className="profileParagraph">
            <BsCashCoin className="cashIcon" />
            <strong>Account Balance: </strong>{" "}
            {profile.settings_account_balance}
            <Link className="editPhone" to="/fundaccount">
              <BsFillPlusSquareFill />
            </Link>
          </p>

          <br></br>
          {[37, 92, 36].includes(user.id) ? (
            <p className="profileParagraph text-gradient ">
              <Link className="editPhone" to="/agentmanagement">
                <BsFillPersonFill className="cashIcon" />
                <strong>Manage Agents </strong>
              </Link>
            </p>
          ) : (
            ""
          )}
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

// import React, { useEffect, useState, useContext } from "react";
// import {
//   BsFillBellFill,
//   BsFillEnvelopeFill,
//   BsPersonCircle,
//   BsFillPersonXFill,
//   BsBriefcaseFill,
//   BsEyedropper,
//   BsJustify,
//   BsFillPlusSquareFill,
//   BsCashCoin,
// } from "react-icons/bs";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import AuthContext from "../AuthContext";
// import { io } from "socket.io-client";
// import CountdownTimer from "../components/Countdowntimer";

// function Header(props) {
//   const { OpenSidebar, heading } = props;
//   const { isAuthenticated, user, logout } = useContext(AuthContext);
//   const [showMessages, setShowMessages] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [acceptedMessages, setAcceptedMessages] = useState([]);
//   const [countdownEndTime, setCountdownEndTime] = useState({});
//   const [expired, setExpired] = useState({});
//   const [unread, setUnread] = useState(0);
//   const [showProfile, setShowProfile] = useState(false);
//   const apiUrls = "http://localhost:4000";
//   const userbread = user.userId;

//   const fetchData = async () => {
//     try {
//       const result = await axios.get(
//         `${apiUrls}/api/messages?userbread=${userbread}&reset=false`
//       );

//       const { messages, unreadCount } = result.data;
//       setMessages(messages);
//       setUnread(unreadCount);

//       const expiry = {};
//       messages.forEach((msg) => {
//         const requestTime = new Date(msg.timestamp);
//         const expiryTime = new Date(requestTime.getTime() + 10 * 60 * 1000);
//         if (expiryTime < new Date()) {
//           expiry[msg.id] = true;
//         }
//       });
//       setExpired(expiry);
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//     }
//   };

//   useEffect(() => {
//     if (userbread) {
//       fetchData();
//     }
//   }, [userbread]); // Ensure fetchData runs when userbread changes

//   const handleMessages = () => {
//     setShowMessages(!showMessages);
//     fetchData(); // Fetch messages whenever the icon is clicked
//   };

//   return (
//     <header className="header">
//       <div className="menu-icon">
//         <BsJustify className="icon" onClick={OpenSidebar} />
//       </div>
//       <div className="header-left"></div>
//       <div className="text-gradient agent-title">{heading}</div>
//       <div className="header-right">
//         <p className="unread">
//           <strong>{unread} </strong>
//         </p>
//         <BsFillBellFill className={unread > 0 ? "icon-bell" : "icon"} />
//         <BsFillEnvelopeFill
//           onClick={handleMessages}
//           className={
//             unread > 0 ? "icon iconBlack iconCursor" : "icon iconCursor"
//           }
//         />
//         <BsPersonCircle
//           onClick={() => setShowProfile(!showProfile)}
//           className="icon iconCursor"
//         />
//       </div>
//       {showMessages && (
//         <div className="message-popup">
//           {messages.map((msg) => (
//             <div key={msg.id} className={`message-card ${msg.type}`}>
//               {/* Message card content */}
//             </div>
//           ))}
//         </div>
//       )}
//       {showProfile && (
//         <div className="profile-popup bg-black-gradient">
//           {/* Profile content */}
//         </div>
//       )}
//     </header>
//   );
// }

// export default Header;
