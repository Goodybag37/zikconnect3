import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';
import ReactPaginate from 'react-paginate';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { FaThumbsUp } from 'react-icons/fa';
import { IoMdThumbsDown } from 'react-icons/io';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import { BsFillPersonLinesFill } from "react-icons/bs"
import {BisPhoneCall } from '@meronex/icons/bi/';
import {LogoWhatsapp} from '@meronex/icons/ios/';

import { BsFillArchiveFill, BsFileEarmarkPerson, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill } from 'react-icons/bs';

function YourComponent() {
  const [schoolfeeagents, setSchoolfeeagents] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [goodRating, setGoodRating] = useState(0);
  const [ratings, setRatings] = useState({});
  const [badRating, setBadRating] = useState(0);
  const [agentId, setAgentId]  = useState(0)
  const [hasVoted, setHasVoted]= useState(false)
  const [agentType, setAgentType]= useState()
  const [userId, setUserId] = useState()

  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;

  const displayUsers = schoolfeeagents && schoolfeeagents.length > 0
  ? schoolfeeagents.map(createCard)
  : null;

  const fetchData = async (page) => {
    try {
      const response = await axios.get(`http://localhost:4000/schoolfeeagentsapi?page=${page + 1}&pageSize=${usersPerPage}`);
      console.log(response);
      const { schoolfeeagents: newschoolfeeagents, totalPages: newTotalPages, userId: userId } = response.data;
      setUserId(userId);
      setSchoolfeeagents(newschoolfeeagents);
      setTotalPages(newTotalPages);
      if (newschoolfeeagents.length > 0) {
        setGoodRating(parseInt(newschoolfeeagents[0].good_rating, 10))
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
    setAgentType("schoolfee")

  
    // Check if the user has already voted for this agent
    const hasVotedForAgent = localStorage.getItem(`voted_${agentId}_${agentType}`);
    if (hasVotedForAgent) {
      // Display a message or take appropriate action to inform the user
      alert("Sorry!! You have already voted for this agent.");
      return;
    }
  
    try {
      // Send the vote to the server
      const response = await axios.post(`http://localhost:4000/patchratingschoolfee?agentId=${agentId}&goodRating=${goodRating}`);
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
    setAgentType("schoolfee")

    const hasVotedForAgent = localStorage.getItem(`voted_${agentId}_${agentType}`);
    if (hasVotedForAgent) {
      // Display a message or take appropriate action to inform the user
      alert("Sorry!! You have already voted for this agent.");
      return;
    }
  
    try {
      // Send the vote to the server
      const response = await axios.post(`http://localhost:4000/patchratingschoolfee?agentId=${agentId}&badRating=${badRating}`);
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
    return (
      <div className='card-lodge bg-black-gradient'>
        <div className='card-inner'>
          <div key={agent.id}>
            <ul className='roommate-list-head'>
              <li>
                <div className='profilePic'>
                  <div className='bg-blue-gradient profileHeader'>
                    <p className='profileInfo'> Agent: {agent.fk_user_id}</p>
                    <p className='profileInfo'> User: {agent.id} </p>
                  </div>

                  <p className='profile-body'>Generate Remita and pay your school fees with me </p>
                </div>
              </li>
              <li className='roommate-list'>
                Name: {agent.name}
              </li>
              <li className='roommate-list'>
                Contact: {agent.contact}
              </li>
              <li className='roommate-list roommate-list-button'>
                <a href={`https://wa.me/${agent.contact}`}>
                  <button className='bg-blue-gradient roommate-button'>
                    <LogoWhatsapp className='connect_icon' />Chat
                  </button>
                </a>
                <a href={`https://wa.me/${agent.contact}`}>
                  <button className='bg-blue-gradient roommate-button'>
                    <BisPhoneCall className='connect_icon' />Call 
                  </button>
                </a>
              </li>
            </ul>
          </div>
          <BsFillPersonLinesFill className='card_icon' />
        </div>
        <div className='rating'>

<div >
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
  <a href='https://whatsapp.com' className ='text-gradient report'>Report Agent ?</a>
      </div>
    );
  }

  return (
    <main className="main-container">
      <LazyLoadComponent>
  <div className='main-cards-roommates'>
    {displayUsers || <p>Loading...</p>}
    
  </div>
</LazyLoadComponent>

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
