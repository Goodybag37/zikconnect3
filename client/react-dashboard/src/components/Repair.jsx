import React, { useEffect, useContext, useState, useRef } from "react";
import axios from "axios";
import "../App.css";
import ReactPaginate from "react-paginate";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { FaThumbsUp } from "react-icons/fa";
import { IoMdThumbsDown } from "react-icons/io";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { BisPhoneCall } from "@meronex/icons/bi/";
import { LogoWhatsapp } from "@meronex/icons/ios/";
// import { io } from "socket.io-client";
import {
  BsPatchCheckFill,
  BsXOctagonFill,
  BsXLg,
  BsFillPersonFill,
} from "react-icons/bs";
import AuthContext from "../AuthContext";
import Modal from "./Modal";
import { Link } from "react-router-dom";
import {
  BsFillArchiveFill,
  BsFileEarmarkPerson,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsFillBellFill,
  BsCashCoin,
} from "react-icons/bs";
import { BsBrowserEdge } from "react-icons/bs";
import CountdownTimer from "./Countdowntimer";

function YourComponent() {
  const [repairagents, setRepairagents] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [goodRating, setGoodRating] = useState({});
  const [badRating, setBadRating] = useState({});
  const [ratings, setRatings] = useState({});
  const [reviewFormVisible, setReviewFormVisible] = useState(false);

  const [agentId, setAgentId] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [agentType, setAgentType] = useState();
  const [userId, setUserId] = useState();
  const [repairgReviews, setRepairgReviews] = useState();
  const [repairbReviews, setRepairbReviews] = useState();
  const [showReviewForm, setShowReviewForm] = useState({});
  const [reviewText, setReviewText] = useState({});
  const [reviewTypeSelection, setReviewTypeSelection] = useState({});
  const [flippedCards, setFlippedCards] = useState({});
  const [reviewType, setReviewType] = useState({});
  const [showWarning, setShowWarning] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showChatCall, setShowChatCall] = useState({});
  const [showConnectButtons, setShowConnectButtons] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [showModal4, setShowModal4] = useState(false);
  const [showModal5, setShowModal5] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalContent2, setModalContent2] = useState("");
  const [modalContent3, setModalContent3] = useState("");
  const [modalContent4, setModalContent4] = useState("");
  const [modalContent5, setModalContent5] = useState("");
  const [countdownEndTime, setCountdownEndTime] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [connecting, setConnecting] = useState({});
  const [permission, setPermission] = useState(null);
  const [locationM, setLocationM] = useState(null);
  const [type, setType] = useState("Automatic");
  const locationRef = useRef(null);
  const reviewRef = useRef(null);

  const [locationA, setLocationA] = useState({
    latitude: null,
    longitude: null,
    error: null,
  });

  const [orderCode, setOrderCode] = useState("");
  const [orderCode2, setOrderCode2] = useState("");

  const [openPopup, setOpenPopup] = useState(false);
  const [openPopup2, setOpenPopup2] = useState(false);
  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;
  const maxLength = 250;

  const { isAuthenticated, user, login } = useContext(AuthContext);

  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId;

  // Optional chaining to avoid errors if user is null
  const emailbread = user.email;
  const isPhoneVerified = user.isPhoneVerified;
  const apiUrls = process.env.REACT_APP_API_URL;
  const apiUrl = "http://localhost:4000";
  console.log("user bread", userbread);
  // const socket = io(apiUrl);

  const fetchData = async (page) => {
    try {
      const response = await axios.get(
        `${apiUrls}/api/repairagentsapi?page=${
          page + 1
        }&pageSize=${usersPerPage}`
      );
      // localStorage.removeItem("reviewFormVisible");

      // socket.on("message ", (data) => {
      //   console.log(data);
      // });
      console.log(response);
      const {
        repairagents: newrepairagents,
        totalPages: newTotalPages,
        userId: userId,
        repairGreviews: repairGreviews,
        repairBreviews: repairBreviews,
      } = response.data;
      setUserId(userId);
      setRepairgReviews(repairGreviews);
      setRepairbReviews(repairBreviews);
      setRepairagents(newrepairagents);
      setTotalPages(newTotalPages);
      if (newrepairagents.length > 0) {
        const agentRatings = {};
        newrepairagents.forEach((agent) => {
          agentRatings[agent.id] = parseInt(agent.good_rating, 10);
        });

        // Update the goodRating state to contain ratings per agent
        setGoodRating(agentRatings);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         setPermission("granted");

  //         setLocationA({
  //           latitude: position.coords.latitude,
  //           longitude: position.coords.longitude,
  //           locationM: null,
  //           error: null,
  //         });
  //       },
  //       (error) => {
  //         if (error.code === 1) {
  //           // Permission denied
  //           setPermission("denied");
  //         } else {
  //           setPermission("error");
  //         }
  //         setLocationA({
  //           latitude: null,
  //           longitude: null,
  //           locationM: null,
  //           error: error.message,
  //         });
  //       }
  //     );
  //   } else {
  //     setPermission("unsupported");
  //     setLocationA({
  //       latitude: null,
  //       longitude: null,
  //       locationM: null,
  //       error: "Geolocation is not supported by this browser.",
  //     });
  //   }
  // }, []);

  // useEffect(() => {
  //   console.log("permission is ", permission, locationA);
  // }, [permission]);

  const toggleReviewForm2 = (type, ordercode) => {
    console.log("Button clicked!");
    setReviewFormVisible((prevState) => true);
    localStorage.setItem("reviewFormVisible", true);
    if (type == "confirm") {
      confirmConnect(ordercode);
    } else {
      rejectConnect();
    }
  };

  useEffect(() => {
    const fetchPendingConnects = async () => {
      const modalState = localStorage.getItem("showModal");
      const userId = userbread;
      const isReviewFormVisible =
        reviewFormVisible || localStorage.getItem("reviewFormVisible");

      console.log("is review form visible", isReviewFormVisible);

      const type = "repair";

      try {
        const response = await axios.get(
          `${apiUrls}/api/check-pending-connects?userId=${userId}&type=${type}`
        );
        console.log("response.data is", response.data);
        const agent = response.data.agent_id;
        const orderCode = response.data.order_id;
        const countdownTime = response.data.request_time;
        const status = response.data.status;
        const contact = response.data.contact;
        const name = response.data.name;
        const agentLocation =
          response.data.agent_location.locationData.display_name;
        let reviewForm = false;

        const canReviewA = canReview[agent];
        const selectedReviewType = reviewTypeSelection[agent];
        const duration =
          response.data.duration ?? "Manual Location Comes with no durations";
        const distance =
          response.data.distance ?? "Manual Location Comes with no distance";

        setOrderCode2(orderCode);

        // const { agent_, orderCode, countdownEndTime } = response.data;
        // console.log(agent);
        // console.log(orderCode);
        // console.log(userId);

        if (status === "pending") {
          setShowModal(true);

          const time = localStorage.getItem("countdownEndTime");
          const endTime = new Date(
            new Date(countdownTime).getTime() + 10 * 60 * 1000
          );

          console.log("Original requestTime:", countdownTime);
          console.log("Calculated endTime:", endTime);

          const remainingTime = endTime - new Date();
          console.log("Remaining time (ms):", remainingTime);

          if (endTime) {
            const content = (
              <>
                <h2 className="text-gradient popup-heading">
                  Pending Connect{" "}
                </h2>
                <p className="popup-paragraph">
                  You have a pending connect from agent{agent}. The order will
                  expire in{" "}
                  <CountdownTimer
                    endTime={endTime}
                    onEnd={() => {
                      setConnecting((prevState) => ({
                        ...prevState,
                        [agent]: "",
                      }));
                      setShowModal(false);
                    }} // Close modal when countdown ends
                  />
                </p>

                <Link to="/agents">
                  <button
                    // onClick={() => {
                    //   localStorage.removeItem("reviewFormVisible");
                    // }}
                    className="signoutButton profileParagraph text-gradient"
                  >
                    Back to Agents
                  </button>
                </Link>
              </>
            );

            setModalContent(content);
          }
        } else if (status === "accepted") {
          setShowModal2(true);

          const time = localStorage.getItem("countdownEndTime");
          const endTime2 = new Date(
            new Date(countdownTime).getTime() + 10 * 60 * 3000
          );

          console.log("Original requestTime:", countdownTime);
          console.log("Calculated endTime:", endTime2);

          const remainingTime = endTime2 - new Date();
          console.log("Remaining time (ms):", remainingTime);

          if (endTime2) {
            const content2 = (
              <>
                <h2 className=" text-gradient popup-heading ">
                  Connect Accepted{" "}
                </h2>
                <p className="popup-paragraph">
                  Greatnews !! the agent has accepted your connect, the order
                  will be completed in 30 minutes. you can now contact the agent
                  for a quicker response from them. Please ensure to address
                  them politely as zikconnect takes any form of abuse of agents
                  seriously.
                  <CountdownTimer
                    endTime={endTime2}
                    onEnd={() => {
                      setConnecting((prevState) => ({
                        ...prevState,
                        [agent]: "",
                      }));
                      setShowModal2(false);
                    }} // Close modal when countdown ends
                  />
                </p>

                <div className="chat-call-buttons">
                  <a href={`https://wa.me/${contact}`}>
                    <button className="bg-blue-gradient roommate-button  connect-accept-button-chat">
                      <LogoWhatsapp className="connect_icon" />
                      Chat
                    </button>
                  </a>
                  <a href={`tel:${contact}`}>
                    <button className="bg-blue-gradient roommate-button connect-accept-button">
                      <BisPhoneCall className="connect_icon" />
                      Call
                    </button>
                  </a>
                </div>

                <h4 className="popup-heading pop-up-detail">Details</h4>
                <p className="popup-paragraph">Order Number: {orderCode}</p>
                <p className="popup-paragraph">Agent ID: {agent}</p>
                <p className="popup-paragraph">Agent Full Name: {name}</p>
                <p className="popup-paragraph">
                  Agent Location: {agentLocation}
                </p>
                <Link to="/agents">
                  <button className="signoutButton profileParagraph text-gradient">
                    Back to Agents
                  </button>
                </Link>
              </>
            );

            setModalContent2(content2);
          }
        } else if (status === "completed") {
          setShowModal3(true);
          console.log(orderCode2);
          const endTime3 = new Date(
            new Date(countdownTime).getTime() + 10 * 60 * 500
          );
          if (endTime3) {
            const content3 = (
              <>
                <h2 className=" text-gradient popup-heading ">
                  Connect Completed{" "}
                </h2>
                <p className="popup-paragraph">
                  The order time has been completed, please click confirm if the
                  agent has responded to you and is willing to deliver services
                  or click reject if they are unresponsive or not available.
                  <div className="chat-call-buttons">
                    <button
                      onClick={() => {
                        toggleReviewForm2("confirm", orderCode);
                        // confirmConnect(orderCode);
                        // setConnecting((prevState) => ({
                        //   ...prevState,
                        //   [agent]: "",
                        // }));
                        // setCanReview((prev) => ({ ...prev, [agent]: true }));
                        // setShowModal3(false);
                      }}
                      className="bg-blue-gradient roommate-button  connect-accept-button-chat"
                    >
                      <BsPatchCheckFill className="connect_icon" />
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        toggleReviewForm2("reject", orderCode);
                        // setConnecting((prevState) => ({
                        //   ...prevState,
                        //   [agent]: "",
                        // }));
                        // rejectConnect();
                        // setCanReview((prev) => ({ ...prev, [agent]: true }));
                        // setShowModal3(false);
                      }}
                      className="bg-blue-gradient roommate-button connect-accept-button"
                    >
                      <BsXOctagonFill className="connect_icon" />
                      Reject
                    </button>
                    {/* <button
                      className="bg-blue-gradient agent-button submit-review"
                      onClick={() => {
                        toggleReviewForm2();
                      }}
                    >
                      Leave A Review
                    </button> */}
                    {isReviewFormVisible && (
                      <div className="review-form">
                        <br></br>
                        {/* <h2>Leave a Review</h2> */}
                        <br></br>
                        <div className="review-type-selection">
                          <label
                            htmlFor={`review-type-${agent}`}
                            className="select-label"
                          >
                            Select Type:
                            <select
                              id={`review-type-${agent}`}
                              className="review-select"
                              value={selectedReviewType || ""}
                              onChange={(e) => {
                                localStorage.setItem(
                                  "reviewType",
                                  e.target.value
                                );
                                handleReviewTypeChange(agent, e.target.value);
                              }}
                            >
                              <option value="" disabled>
                                {selectedReviewType || "Select..."}
                              </option>
                              <option value="good">Good</option>
                              <option value="bad">Bad</option>
                            </select>
                          </label>
                        </div>
                        <textarea
                          maxLength={maxLength}
                          className="review-textarea"
                          ref={reviewRef} // Attach the ref here
                        ></textarea>

                        <button
                          className="bg-blue-gradient agent-button submit-review"
                          onClick={() => {
                            submitReview(agent);
                            setShowModal3(false);
                            setCanReview(false);
                            localStorage.removeItem("reviewFormVisible");
                          }}
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </div>
                  <CountdownTimer endTime={endTime3} />
                </p>
              </>
            );

            setModalContent3(content3);
          }
        }
      } catch (error) {
        console.error("Error fetching pending connects:", error);
      }
    };

    fetchPendingConnects(); // Call the async function inside useEffect
  }, [reviewFormVisible]);

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

  const toggleReviewForm = (agentId) => {
    setShowReviewForm((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
  };

  const generateUniqueCode = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;

    for (let i = 0; i < 16; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  };

  const handleGenerateOrderCode = () => {
    const newCode = generateUniqueCode();
    console.log(newCode);
    setOrderCode(newCode);
  };

  const handleReviewTextChange = (agentId, text) => {
    setReviewText((prev) => ({
      ...prev,
      [agentId]: text,
    }));
  };

  const confirmConnect = async (orderCode) => {
    const orderId = orderCode;
    console.log(" i have updated", orderId);
    try {
      await axios.post(
        `${apiUrls}/api/complete-connect`,
        { orderCode },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
    } catch (error) {}
  };

  const rejectConnect = async () => {
    const orderId = orderCode2;
    try {
      await axios.post(
        `${apiUrls}/api/incomplete-connect`,
        { orderId },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
    } catch (error) {}
  };

  const submitReview = async (agentId) => {
    const review = reviewText[agentId] || reviewRef.current.value;
    const type = reviewType[agentId] || localStorage.getItem("reviewType");
    const userid = userbread;
    const agentType = "repair";
    console.log("a review request came here", type, review);

    if (!review || !type) return;

    try {
      await axios.post(
        `${apiUrls}/api/submitreview`,
        {
          type,
          agentType,
          userid,
          agentId,
          review,
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      console.log(agentId);
      console.log(userid);
      alert("Review submitted successfully!");
      setReviewText((prev) => ({
        ...prev,
        [agentId]: "",
      }));
      setReviewType((prev) => ({
        ...prev,
        [agentId]: "",
      }));
      setShowReviewForm((prev) => ({
        ...prev,
        [agentId]: false,
      }));
    } catch (error) {
      alert("You have already reviewed this agent");
    }
  };

  const handleShowProfile = async () => {
    try {
      const result = await axios.get(
        `${apiUrls}/api/agentprofile?userId=${userbread}&type=repairagents`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      console.log("Server responded", result.data);
      console.log("Response status is", result.status);

      if (result.status === 200 && result.data.length > 0) {
        // Handle the array response
        const response = result.data[0];
        console.log("Agent profile:", response); // Assuming you want the first item
        setModalContent5(
          <div>
            <h3 className="profile-head text-gradient">{response.name}</h3>
            <hr />
            <br />
            <p className="profileParagraph">
              {/* <BsFillPersonFill /> <strong>Agent ID: </strong>{" "} */}
              <strong>Agent: </strong> {response.id}
            </p>
            <br />
            <p className="profileParagraph">
              {/* <BsBriefcaseFill /> */}
              <strong>Contact: </strong> {response.contact}
            </p>
            <br />
            <p className="profileParagraph">
              {/* <BsFillTelephoneFill /> */}
              <strong>Location: </strong> {response.location}
              <Link className="editPhone" to="/verifyphone">
                {/* <BsEyedropper /> */}
              </Link>
            </p>
            <br />
            <hr />
            <br />
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
              onClick={() => setShowModal5(false)} // Close the modal when clicked
            >
              Close
            </button>
            <br />
            {/* Add more user details here */}
          </div>
        );
      } else {
        // If no data found, treat it as an error
        setModalContent5(
          <div>
            <p>Oops, you are not a Repair Agent</p>
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
              onClick={() => setShowModal5(false)} // Close the modal when clicked
            >
              Close
            </button>
          </div>
        );
      }

      setShowModal5(true); // Show the modal
    } catch (error) {
      console.error("Error fetching profile:", error);

      if (error.response && error.response.status === 404) {
        // Specifically handle 404 status when user is not an agent
        setModalContent5(
          <div>
            <p>Oops, you are not a Repair Agent</p>
            <button
              className="bg-blue-gradient roommate-button"
              onClick={() => setShowModal5(false)}
            >
              Close
            </button>
          </div>
        );
      } else {
        // Handle any other error (500, network issues, etc.)
        setModalContent5(
          <div>
            <p>
              There was an error fetching your profile. Please try again later.
            </p>
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
              onClick={() => setShowModal5(false)} // Close the modal when clicked
            >
              Close
            </button>
          </div>
        );
      }

      setShowModal5(true);
    }
  };

  const handleReviewTypeChange = (agentId, type) => {
    setReviewType((prev) => ({
      ...prev,
      [agentId]: type,
    }));
  };

  const isSubmitDisabled = (agentId) => {
    return !reviewText[agentId] || !reviewType[agentId];
  };

  async function rateAgentPositive(agentId) {
    // setAgentId(agentId);
    const rateType = "good_rating";
    const agentType = "repairagents";

    const data = new URLSearchParams();
    data.append("agentId", agentId);
    data.append("userId", userbread);
    data.append("rateType", rateType);
    data.append("agentType", agentType);

    try {
      await axios.post(
        `${apiUrls}/api/patchrating`,
        data, // Use the encoded data
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      setGoodRating((prevRatings) => ({
        ...prevRatings,
        [agentId]: prevRatings[agentId] ? prevRatings[agentId] + 1 : 1, // Increment or set to 1 if it doesn't exist
      }));
    } catch (error) {
      if (error.response && error.response.status === 500) {
        alert("Oops, you have already voted for this agent.");
      } else if (error.response && error.response.status === 400) {
        alert("Bad request. Please check the data you are sending.");
      } else {
        console.log("Error:", error.message);
      }
    }
  }

  async function rateAgentNegative(agentId) {
    // setAgentId(agentId);
    const rateType = "bad_rating";
    const agentType = "repairagents";

    const data = new URLSearchParams();
    data.append("agentId", agentId);
    data.append("userId", userbread);
    data.append("rateType", rateType);
    data.append("agentType", agentType);

    try {
      await axios.post(
        `${apiUrls}/api/patchrating`,
        data, // Use the encoded data
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      setBadRating((prevRatings) => ({
        ...prevRatings,
        [agentId]: prevRatings[agentId] ? prevRatings[agentId] + 1 : 1, // Increment or set to 1 if it doesn't exist
      }));
    } catch (error) {
      if (error.response && error.response.status === 500) {
        alert("Oops, you have already voted for this agent.");
      } else if (error.response && error.response.status === 400) {
        alert("Bad request. Please check the data you are sending.");
      } else {
        console.log("Error:", error.message);
      }
    }
  }

  // const handleConnectClick = async (agentId) => {
  //   if (permission !== "granted") {
  //     const locationContent = (
  //       <>
  //         <div className="verifyPopup">
  //           <h2 className="popupHeading inline">Location Access Required</h2>
  //           <BsXLg
  //             className="text-gradient closeModal4"
  //             onClick={() => setShowModal5(false)}
  //           />
  //         </div>
  //         <p className="popup-paragraph">
  //           You need to allow us detect your location so our agents can serve
  //           you faster and more efficiently, please go to your browser settings
  //           and allow location for this website
  //         </p>
  //         <button
  //           className="bg-red-gradient roommate-button connect-accept-button"
  //           onClick={() => setShowModal5(false)}
  //         >
  //           Try Again
  //         </button>

  //         <form >

  //         </form>
  //       </>
  //     );
  //     setShowModal5(true);
  //     setModalContent5(locationContent);
  //     setConnecting(false);

  //     return;
  //   }
  //   if (isPhoneVerified === false) {
  //     const content4 = (
  //       <>
  //         <div className="verifyPopup">
  //           <h2 className="popupHeading inline">Verify Phone !! </h2>
  //           <BsXLg
  //             className="text-gradient  closeModal4"
  //             onClick={() => setShowModal4(false)}
  //           />
  //         </div>

  //         <p className="popup-paragraph">
  //           You need to verify your phone number to be able to connect with our
  //           agent. This would help them in contacting you after you connect with
  //           them.
  //         </p>
  //         <Link to="/verifyphone">
  //           <button className="bg-blue-gradient roommate-button connect-accept-button">
  //             <BisPhoneCall className="connect_icon" />
  //             Verify Now
  //           </button>
  //         </Link>
  //       </>
  //     );
  //     setShowModal4(true);

  //     setModalContent4(content4);

  //     return;
  //   } else if (countdownEndTime && new Date() < countdownEndTime) {
  //     setShowModal(true);

  //     return;
  //   }

  //   const generateUniqueCode = () => {
  //     const characters =
  //       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  //     let result = "";
  //     const charactersLength = characters.length;

  //     for (let i = 0; i < 32; i++) {
  //       result += characters.charAt(
  //         Math.floor(Math.random() * charactersLength)
  //       );
  //     }

  //     return result;
  //   };

  //   // Generate the order code and update the state
  //   const newCode = generateUniqueCode();
  //   setOrderCode(newCode); // Update order code state

  //   // Find and set the selected agent
  //   const selectedAgent = repairagents.find((agent) => agent.id === agentId);
  //   setSelectedAgent(selectedAgent);

  //   const selected = selectedAgent.contact;
  //   // Update selected agent state
  //   console.log(selected);

  //   // Calculate end time for the countdown (10 minutes from now)
  //   const endTime = new Date(new Date().getTime() + 10 * 60 * 1000);
  //   localStorage.setItem("countdownEndTime", endTime.toISOString());

  //   // Ensure the content uses the updated state values
  //   setTimeout(() => {
  //     const content = (
  //       <>
  //         <h2 className=" text-gradient popup-heading">Connect Request</h2>
  //         <p className="popup-paragraph">
  //           You have made a new connect. The agent will have 10 minutes to
  //           respond. Please wait for their confirmation.
  //         </p>
  //         <h4 className="popup-heading">Details</h4>
  //         <p className="popup-paragraph">Order Number: {newCode}</p>
  //         {selectedAgent && (
  //           <>
  //             <p className="popup-paragraph">
  //               Agent ID: {selectedAgent.agentId}
  //             </p>
  //             <p className="popup-paragraph">
  //               Agent Full Name: {selectedAgent.name}
  //             </p>
  //           </>
  //         )}
  //         <CountdownTimer endTime={endTime} />
  //       </>
  //     );

  //     setModalContent(content);
  //     setShowModal(true);
  //   }, 0);
  //   try {
  //     const userId = userbread;
  //     const agentType = "repair";
  //     const agentUserId = selectedAgent.fk_user_id;
  //     await axios.post(
  //       `${apiUrl}/api/send-connect-email`,
  //       {
  //         agentId: agentId,
  //         userId: userId,
  //         orderId: newCode,
  //         agentType: agentType,
  //         agentUserId: agentUserId,
  //       },
  //       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  //     );
  //     console.log(`Email sent to agent with ID: ${agentId}`);
  //   } catch (error) {
  //     console.error("Error sending email:", error);
  //   }
  // };

  const handleConnectClick = async (agentId) => {
    if (isPhoneVerified === false) {
      const content4 = (
        <>
          <div className="verifyPopup">
            <h2 className="popupHeading inline">Verify Phone !!</h2>
            <BsXLg
              className="text-gradient closeModal4"
              onClick={() => setShowModal4(false)}
            />
          </div>
          <p className="popup-paragraph">
            You need to verify your phone number to be able to connect with our
            agent. This would help them in contacting you after you connect with
            them.
          </p>
          <Link to="/verifyphone">
            <button className="bg-blue-gradient roommate-button connect-accept-button">
              <BisPhoneCall className="connect_icon" />
              Verify Now
            </button>
          </Link>
        </>
      );
      setShowModal4(true);
      setModalContent4(content4);
      return;
    }
    try {
      const response = await axios.get(
        `${apiUrls}/api/get-account-balance?userId=${userbread}`
      );

      const accountBalance = response.data.account_balance;
      console.log("account balance is", accountBalance);

      if (accountBalance < 100) {
        const content5 = (
          <>
            <div className="verifyPopup">
              <h2 className="popupHeading inline">Low Balance</h2>
              <BsXLg
                className="text-gradient closeModal4"
                onClick={() => setShowModal4(false)}
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

        setShowModal4(true);
        setModalContent4(content5);
        setConnecting((prevState) => ({
          ...prevState,
          [agentId]: "",
        }));
        return;
      }
    } catch (error) {
      console.error("Error fetching account balance:", error);
    }

    // Request location access first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Location granted:", latitude, longitude);

          // Continue with connection logic AFTER location is granted
          processConnection(agentId, latitude, longitude);
          console.log("location is granted ");
          setConnecting(true);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            const latitude = null;
            const longitude = null;
            // If location permission is denied, show a modal to inform the user
            const locationContent = (
              <>
                <div className="verifyPopup">
                  <h2 className="popupHeading inline">
                    {type == "Automatic"
                      ? "Location Access Denied"
                      : "Use Manual Location"}
                  </h2>
                  <BsXLg
                    className="text-gradient closeModal4"
                    onClick={() => {
                      // setType("Automatic");
                      setConnecting((prevState) => ({
                        ...prevState,
                        [agentId]: "",
                      }));

                      setShowModal5(false);
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
                        setShowModal5(false);
                        setType("Manual");
                        setConnecting((prevState) => ({
                          ...prevState,
                          [agentId]: "",
                        }));
                      }}
                    >
                      Input Location Manually
                    </button>
                  </div>
                )}

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
                        setShowModal5(false);
                        // Handle manual location input logic
                        setLocationA({
                          latitude: null,
                          longitude: null,
                          locationM: manualLocation, // Use the manual input state
                          error: null,
                        });

                        processConnection(agentId, null, null, manualLocation);
                        setConnecting((prevState) => ({
                          ...prevState,
                          [agentId]: "",
                        }));
                      }}
                    >
                      Connect
                    </button>
                  </div>
                )}
              </>
            );
            setShowModal5(true);
            setModalContent5(locationContent);
          }
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Function to process connection logic after location permission is granted
  const processConnection = async (agentId, latitude, longitude, locationM) => {
    // Check countdown after location permission is granted
    if (countdownEndTime && new Date() < countdownEndTime) {
      // Show the modal for countdown
      setShowModal(true);
      return;
    }

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

    const selectedAgent = repairagents.find((agent) => agent.id === agentId);
    setSelectedAgent(selectedAgent);
    const selected = selectedAgent.contact;
    console.log(selected);

    const endTime = new Date(new Date().getTime() + 10 * 60 * 1000);
    localStorage.setItem("countdownEndTime", endTime.toISOString());

    // setTimeout(() => {
    const content = (
      <>
        <h2 className=" text-gradient popup-heading">Connect Request</h2>
        <p className="popup-paragraph">
          You have made a new connect. The agent will have 10 minutes to
          respond. Please wait for their confirmation.
        </p>
        <h4 className="popup-heading">Details</h4>
        <p className="popup-paragraph">Order Number: {newCode}</p>
        {selectedAgent && (
          <>
            <p className="popup-paragraph">Agent ID: {agentId}</p>
            <p className="popup-paragraph">
              Agent Full Name: {selectedAgent.name}
            </p>
          </>
        )}
        <CountdownTimer
          endTime={endTime}
          onEnd={() => {
            setConnecting((prevState) => ({
              ...prevState,
              [agentId]: "",
            }));
            setShowModal(false);
          }} // Close modal when countdown ends
        />

        <Link to="/agents">
          <button className="signoutButton profileParagraph text-gradient">
            Back to Agents
          </button>
        </Link>
      </>
    );

    setModalContent(content);
    setShowModal(true);
    // }, 0);

    try {
      const userId = userbread;
      const agentType = "repair";
      const agentUserId = selectedAgent.fk_user_id;

      await axios.post(
        `${apiUrls}/api/send-connect-email`,
        {
          agentId: agentId,
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
        `Email sent to agent with ID: ${agentId} ${type} ${locationM}`
      );
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  function createCard(agent, showChatCall, handleConnectClick) {
    const isFlipped = flippedCards[agent.id];
    const isReviewFormVisible = showReviewForm[agent.id];
    const selectedReviewType = reviewTypeSelection[agent.id];
    const isPopupOpen = openPopup[agent.id];
    const isPopupOpen2 = openPopup2[agent.id];
    const chatCallVisible = showChatCall[agent.id] || false;
    const reviewsG = agent.good_reviews || [];
    const reviewsB = agent.bad_reviews || [];
    const canReviewA = canReview[agent.id];

    return (
      <div
        className={`card-lodge bg-black-gradient ${isFlipped ? "flipped" : ""}`}
      >
        <div className={`card-inners ${isFlipped ? "flipped" : ""}`}>
          {isFlipped ? (
            <div className="flipped-card">
              <div className="text">
                <BsXLg
                  className="text-gradient card-icon-flip"
                  onClick={() => handleFlip(agent.id)}
                />

                <h2 className="info-header">Info</h2>

                <p>
                  User ID: {agent.fk_user_id}
                  <hr />
                  <br />
                  <br />
                  Agent ID: {agent.id}
                  <hr />
                  <br />
                  <br />
                  Full Name: {agent.name}
                  <hr />
                  <br />
                  <br />
                  Account Created on: {agent.account_created}
                  <hr />
                  <br />
                  <br />
                  Became Agent on: {agent.agent_date}
                  <hr />
                  <br />
                  <br />
                  Total Connect Received : {agent.total_connect_received}
                  <hr />
                  <br />
                  <br />
                  Total Completed Orders : {agent.completed_orders}
                  <hr />
                  <br />
                  <br />
                  Average Completed Orders :{" "}
                  {Math.round(
                    (agent.completed_orders / agent.total_connect_received) *
                      100
                  )}
                  %
                  <hr />
                  <br />
                  <br />
                  Manual Location: {agent.location}
                </p>
                <hr />
                <br />
                <br />

                <h2 className="info-header">
                  Reviews
                  <FaThumbsUp className="review-button review-button-good" />{" "}
                  {agent.good_reviews_count} / {agent.bad_reviews_count}{" "}
                  <IoMdThumbsDown className="review-button review-button-bad " />{" "}
                </h2>
                <h3 className="text-gradient">
                  Good Reviews ({agent.good_reviews_count})
                </h3>
                {reviewsG.map((review, index) => (
                  <div className="text-gradient" key={index}>
                    <p>
                      User{review.user_id} {review.date}
                    </p>
                    <p>{review.text}</p>
                    <hr />
                  </div>
                ))}
                <br />
                <h3 className="badreview">
                  Bad Reviews ({agent.bad_reviews_count})
                </h3>
                {reviewsB.map((review, index) => (
                  <div className="badreview" key={index}>
                    <p>
                      User{review.user_id} {review.date}
                    </p>
                    <p>{review.text}</p>
                    <hr />
                  </div>
                ))}

                <button
                  className="bg-blue-gradient agent-button leave-review-button"
                  onClick={() => {
                    if (canReviewA) {
                      setOpenPopup((prev) => ({ ...prev, [agent.id]: true }));
                      toggleReviewForm(agent.id);
                    } else {
                      setOpenPopup2((prev) => ({ ...prev, [agent.id]: true }));
                    }
                  }}
                >
                  <BsFileEarmarkPerson className="card_icon" />
                  Leave a review
                </button>
                {isPopupOpen && (
                  <div className="rounded-md p-4 bg-black-gradient popup">
                    <div className="flex flex-row justify-between">
                      <h2 className="popup-heading">Note!! </h2>
                      <button
                        className="popup-close"
                        onClick={() => {
                          setOpenPopup((prev) => ({
                            ...prev,
                            [agent.id]: false,
                          }));
                        }}
                      >
                        X
                      </button>{" "}
                      {/* Close popup for this agent */}
                    </div>
                    <p className="text-xl">
                      All reviews are investigated. Submitting false and
                      malicious reviews could have you banned.
                    </p>
                  </div>
                )}

                {isPopupOpen2 && (
                  <div className="rounded-md p-4 bg-black-gradient popup">
                    <div className="flex flex-row justify-between">
                      <h2 className="popup-heading">Oops!! </h2>
                      <button
                        className="popup-close"
                        onClick={() => {
                          setOpenPopup2((prev) => ({
                            ...prev,
                            [agent.id]: false,
                          }));
                        }}
                      >
                        X
                      </button>{" "}
                      {/* Close popup for this agent */}
                    </div>
                    <p className="text-xl">
                      You Need to connect with the agent before you can review
                      them
                    </p>
                  </div>
                )}

                {isReviewFormVisible && (
                  <div className="review-form">
                    <div className="review-type-selection">
                      <label
                        htmlFor={`review-type-${agent.id}`}
                        className="select-label"
                      >
                        Select Type:
                        <select
                          id={`review-type-${agent.id}`}
                          className="review-select"
                          value={selectedReviewType || ""}
                          onChange={(e) =>
                            handleReviewTypeChange(agent.id, e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Select...
                          </option>
                          <option value="good">Good</option>
                          <option value="bad">Bad</option>
                        </select>
                      </label>
                    </div>
                    {reviewType[agent.id] && (
                      <>
                        <textarea
                          maxLength={maxLength}
                          className="review-textarea"
                          value={reviewText[agent.id] || ""}
                          onChange={(e) =>
                            handleReviewTextChange(agent.id, e.target.value)
                          }
                        ></textarea>

                        <button
                          className="bg-blue-gradient agent-button submit-review"
                          onClick={() => {
                            submitReview(agent.id);
                            toggleReviewForm(agent.id);
                            setCanReview(false);
                          }}
                          disabled={isSubmitDisabled(agent.id)}
                        >
                          Submit
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div key={agent.id}>
                <ul className="roommate-list-head">
                  <li>
                    <div className="profilePic">
                      <div className="bg-blue-gradient profileHeader">
                        <p className="profileInfo">
                          {" "}
                          USER : {agent.fk_user_id}
                        </p>
                        <p className="profileInfo"> AGENT : {agent.id} </p>
                      </div>
                      <p className="profile-body">
                        I am an electrician who can fix your home aplliances
                        having electrical issues
                      </p>
                    </div>
                  </li>
                  <li className="roommate-list">Name: {agent.name}</li>
                  <li className="roommate-list">Location: {agent.location}</li>
                  <li className="roommate-list roommate-list-button">
                    {!chatCallVisible && (
                      <button
                        key={agent.id}
                        className="bg-blue-gradient roommate-button"
                        onClick={() => {
                          setConnecting((prevState) => ({
                            ...prevState,
                            [agent.id]: "connecting",
                          }));
                          handleConnectClick(agent.id);
                        }}
                        disabled={
                          (countdownEndTime && new Date() < countdownEndTime) ||
                          connecting[agent.id] ||
                          agent.account_balance < 100 ||
                          agent.fk_user_id == userbread
                        } // Disable button if countdown is active
                      >
                        {connecting[agent.id] === "connecting"
                          ? "Connecting..."
                          : "Connect"}
                      </button>
                    )}

                    {chatCallVisible && (
                      <div className="chat-call-buttons">
                        <a href={`https://wa.me/${agent.contact}`}>
                          <button className="bg-blue-gradient roommate-button">
                            <LogoWhatsapp className="connect_icon" />
                            Chat
                          </button>
                        </a>
                        <a href={`https://wa.me/${agent.contact}`}>
                          <button className="bg-blue-gradient roommate-button">
                            <BisPhoneCall className="connect_icon" />
                            Call
                          </button>
                        </a>
                      </div>
                    )}
                  </li>
                </ul>
              </div>
              <BsFillPersonLinesFill
                className="text-gradient card_icon"
                onClick={() => handleFlip(agent.id)}
              />
            </>
          )}
        </div>

        {/* Include these elements in the condition to hide them when flipped */}
        {!isFlipped && (
          <>
            <div className="rating">
              <div>
                <input type="hidden" name={agent.id} value={agent.id}></input>
                <input
                  type="hidden"
                  name={agent.fk_user_id}
                  value={agent.fk_user_id}
                ></input>
                <button
                  type="submit"
                  className="rating-button rating-button-good"
                  onClick={() => rateAgentPositive(agent.id)}
                >
                  <FaThumbsUp className="text-gradient" />
                  <p className="text-gradient ">
                    {goodRating[agent.id] !== undefined
                      ? goodRating[agent.id]
                      : agent.good_rating}
                  </p>
                </button>
                <button
                  className="rating-button rating-button-bad"
                  onClick={() => rateAgentNegative(agent.id)}
                >
                  <IoMdThumbsDown />
                  <p className="">
                    {badRating[agent.id] !== undefined
                      ? badRating[agent.id]
                      : agent.bad_rating}
                  </p>
                </button>
              </div>
            </div>
            <a
              href="https://whatsapp.com/2349115780014"
              className="text-gradient report"
            >
              Report Agent?
            </a>
          </>
        )}
      </div>
    );
  }

  const displayUsers =
    repairagents && repairagents.length > 0
      ? repairagents.map((agent) =>
          createCard(agent, showChatCall, handleConnectClick)
        )
      : null;
  return (
    <main className="main-container">
      <p onClick={handleShowProfile} className="agentProfile text-gradient">
        {" "}
        <BsFillPersonFill />
        Profile
      </p>
      <LazyLoadComponent>
        <div className="main-cards-roommates">
          {displayUsers || <p>Loading...</p>}
        </div>
      </LazyLoadComponent>
      <div className="agent-footer">
        <Link to="/becomeagent">
          <button className="agent-button">
            <BsFileEarmarkPerson className="card_icon" />
            Become an agent
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
              activeClassName={"paginationActive"}
            />
          </div>
        )}
      </div>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);

          localStorage.removeItem("showModal");
        }}
        content={modalContent}
        timeoutDuration={10 * 60 * 1000}
      />

      <Modal
        show={showModal2}
        onClose={() => {
          setShowModal2(false);

          localStorage.removeItem("showModal");
        }}
        content={modalContent2}
        timeoutDuration={30 * 60 * 1000}
      />

      <Modal
        show={showModal3}
        onClose={() => {
          setShowModal3(false);

          localStorage.removeItem("showModal");
        }}
        content={modalContent3}
        timeoutDuration={30 * 60 * 1000}
      />

      <Modal
        show={showModal4}
        onClose={() => {
          setShowModal4(false);

          localStorage.removeItem("showModal");
        }}
        content={modalContent4}
      />
      <Modal
        show={showModal5}
        onClose={() => {
          setShowModal5(false);

          localStorage.removeItem("showModal");
        }}
        content={modalContent5}
      />
    </main>
  );
}

export default YourComponent;
