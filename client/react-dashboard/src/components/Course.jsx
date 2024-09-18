import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';
import ReactPaginate from 'react-paginate';
import { FaThumbsUp } from 'react-icons/fa';
import { IoMdThumbsDown } from 'react-icons/io';
import { BsFillArchiveFill, BsFileEarmarkPerson, BsPeopleFill } from 'react-icons/bs';

function YourComponent() {
  const [courseagents, setcourseagents] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [goodRating, setGoodRating] = useState(0);
  const [ratings, setRatings] = useState({});
  const [badRating, setBadRating] = useState(0);
  const [agentId, setAgentId]  = useState(0)
  const [hasVoted, setHasVoted]= useState(false)
  const [agentType, setAgentType]= useState()

  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;

  const displayUsers = courseagents && courseagents.length > 0
  ? courseagents.map(createCard)
  : null;


  const fetchData = async (page) => {
    try {
      const response = await axios.get(`http://localhost:4000/courseagentsapi?page=${page + 1}&pageSize=${usersPerPage}`);
      console.log(response)
      const { courseagents: newcourseagents, totalPages: newTotalPages } = response.data;

      
      

      setcourseagents(newcourseagents);
      setTotalPages(newTotalPages);
      if (newcourseagents.length > 0) {
        setGoodRating(parseInt(newcourseagents[0].good_rating, 10))
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData(pageNumber);
  }, [pageNumber]);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  async function rateAgentPositive(agentId, goodRating) {
    setAgentId(agentId);
    setAgentType("course")

  
    // Check if the user has already voted for this agent
    const hasVotedForAgent = localStorage.getItem(`voted_${agentId}_${agentType}`);
    if (hasVotedForAgent) {
      // Display a message or take appropriate action to inform the user
      alert("Sorry!! You have already voted for this agent.");
      return;
    }
  
    try {
      // Send the vote to the server
      const response = await axios.post(`http://localhost:4000/patchratingcourse?agentId=${agentId}&goodRating=${goodRating}`);
      const updatedRating = response.data.goodRating; // Assuming the server returns the updated rating
  
      // Update the local state
      setGoodRating((prevRatings) => ({
        ...prevRatings,
        [agentId]: updatedRating,
      }));
  
      // Mark that the user has voted for this agent to prevent multiple votes
      localStorage.setItem(`voted_${agentId}_${agentType}`, true);
    } catch (error) {
      console.log(error);
    }
  }

  async function rateAgentNegative(agentId, badRating) {
    setAgentId(agentId);
    setAgentType("course")

    const hasVotedForAgent = localStorage.getItem(`voted_${agentId}_${agentType}`);
    if (hasVotedForAgent) {
      // Display a message or take appropriate action to inform the user
      alert("Sorry!! You have already voted for this agent.");
      return;
    }
  
    try {
      // Send the vote to the server
      const response = await axios.post(`http://localhost:4000/patchratingcourse?agentId=${agentId}&badRating=${badRating}`);
      const updatedRating = response.data.badRating; // Assuming the server returns the updated rating
  
      // Update the local state
      setBadRating(updatedRating);
  
      // Mark that the user has voted for this agent to prevent multiple votes
      localStorage.setItem(`voted_${agentId}_${agentType}`, true);
    } catch (error) {
      console.log(error);
    }
  }
  
  

  function createCard(agent) {
    return(<div className='card-lodge' key={agent.id}>
    <div className='card-inner'>
      <ul className='roommate-list-head'>
        <li>
          <div className='profilePic'>
            <div className='profileHeader'>
              <p className='profileInfo'> Agent: {agent.fk_user_id}</p>
              <p className='profileInfo'> User: {agent.id} </p>
            </div>
          </div>
        </li>
        <li className='roommate-list'>
          Name: {agent.name}
        </li>
        <li className='roommate-list'>
          Course: {agent.course}
        </li>
        <li className='roommate-list'>
          Contact: {agent.contact}
        </li>
        <li className='roommate-list'>
          <a href={`https://wa.me/${agent.contact}`}>
            <button className='roommate-button'>
              <BsPeopleFill className='connect_icon' />Chat Agent
            </button>
          </a>
        </li>
      </ul>
      <BsFillArchiveFill className='card_icon' />
    </div>
    <div className='rating'>
      <div>
        <input type="hidden" name={agent.id} value={agent.id} e></input>
        <input type="hidden" name={agent.fk_user_id} value={agent.fk_user_id}></input>
        <button type='submit' className='rating-button rating-button-good' onClick={() => rateAgentPositive(agent.id, agent.good_rating)}>
            <FaThumbsUp />
            <p> {agent.good_rating}</p>
          </button>
          <button className='rating-button rating-button-bad' onClick={() => rateAgentNegative(agent.id, agent.bad_rating )}>
            <IoMdThumbsDown />
            <p> {agent.bad_rating} </p>
          </button>
      </div>
     
    </div>
  </div>)
  }
    
  

  return (
    <main className="main-container">
      
      <div className='main-cards-roommates'>
    {displayUsers || <p>Loading...</p>}
    
  </div>
      <div className='agent-footer'>
        <button className='agent-button'>
          <BsFileEarmarkPerson className='card_icon' />
          Become an agent
        </button>
        {totalPages > 0 && (
          <div className='pagination-container'>
            <ReactPaginate
              previousLabel={'Previous'}
              nextLabel={'Next'}
              pageCount={totalPages}
              onPageChange={handlePageChange}
              containerClassName={'paginationBttns'}
              previousLinkClassName={'previousBttn'}
              nextLinkClassName={'nextBttn'}
              disabledClassName={'paginationDisabled'}
              activeClassNAme={'paginationActive'}
            />
          </div>
        )}
      </div>
    </main>
  );
}

export default YourComponent;
