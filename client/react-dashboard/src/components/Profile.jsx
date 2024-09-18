import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import { BsFillArchiveFill, BsFileEarmarkPerson, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill } from 'react-icons/bs';

function YourComponent() {
  const [profile, setProfile] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;

  const fetchData = async (page) => {
    try {
      const response = await axios.get(`http://localhost:4000/profileapi`)
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData(response);
  }, []);


  function createCard(user) {
    return (
      <div className='card-lodge'>
        <div className='card-inner'>
          <div key={user.id}>
            <ul className='roommate-list-head'>
              <li>
                <div className='profilePic'>
                  <div className='profileHeader'>
                    <p className='profileInfo'>Full name : {user.name}</p>
                    <p className='profileInfo'> User: {user.id} </p>
                  </div>
                </div>
              </li>
              <li className='roommate-list'>
                Name: {user.name}
              </li>
              <li className='roommate-list'>
                Contact: {user.contact}
              </li>
              <li className='roommate-list'>
                <a href={`https://wa.me/${user.contact}`}>
                  <button className='roommate-button'>
                    <BsPeopleFill className='connect_icon' />Chat Agent
                  </button>
                </a>
              </li>
            </ul>
          </div>
          <BsFillArchiveFill className='card_icon' />
        </div>
        <h1>0</h1>
      </div>
    );
  }

  return (
    <main className="main-container">
      <div className='main-title'>
      <h1 className='agent-title'> PROFILE</h1>
      </div>
      <LazyLoadComponent>
  <div className='main-cards-roommates'>
  {profile.length > 0 ? profile.map(createCard) : <p>No agents available</p>}
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
