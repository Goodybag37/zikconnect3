import React, { useEffect, useState } from 'react';
import axios from 'axios';

import '../App.css';
import ReactPaginate from 'react-paginate';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import 
{ BsFillArchiveFill, BsFileEarmarkPerson,  BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill}
 from 'react-icons/bs'

 function YourComponent() {
  const [roommates, setRoommates] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const usersPerPage = 5;
  const pagesVisited = pageNumber * usersPerPage;

  const displayUsers = roommates.map(createCard);
  

  const fetchData = async (page) => {
    try {
      const response = await axios.get(`http://localhost:4000/roommatesapi?page=${page + 1}&pageSize=${usersPerPage}`);
      console.log(response)
      const { roommates: newRoommates, totalPages: newTotalPages } = response.data;
      setRoommates(newRoommates);
      setTotalPages(newTotalPages);
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
  function createCard(roommate) {
    return (
      
            <div className='card-roommates'>
                <div className='card-inner'>
                 <div  key={roommate.id}>
               <ul className='roommate-list-head'>

               <li>
                <div className='profilePic'>
                  <div className = 'profileHeader'>
                  <p className= 'profileInfo'> User: {roommate.fk_user_id}</p>
                  <p className= 'profileInfo'> Roommate:  {roommate.id} </p>


                  </div>


                </div>

               </li>
                    {/* <li>

                        
                      {roommate.picture ? (
                  <LazyLoadImage className='profilePic' src={`http://localhost:4000/roommates/${roommate.id}`} alt='Roommate' />
                  ) : (
                   <div className='profilePic'>
                   <p>No picture available</p>
                     </div>
                  )}

                    </li> */}
                    <li className='roommate-list'>
                        Name: {roommate.fullname}
                    </li>
                     <li className='roommate-list'>
                        Dept: {roommate.department} 
                     </li>
                     <li className='roommate-list'>
                        Gender: {roommate.gender}
                     </li>
                     <li className='roommate-list'>
                         Phone: {roommate.phone}
                 </li>
                     <li className='roommate-list'>
                     <a href='https://wa.me/{roommate.phone}'>
                 <button className='roommate-button'>
                 <BsPeopleFill className='connect_icon'/>Connect
                </button>
                 </a>
                     </li>
                 </ul>
                
                    
             </div>
   
                    <BsFillArchiveFill className='card_icon'/>
                </div>
                <h1>0</h1>
            </div>
      
    );
  }

  return (
    <main className = "main-container">
        <div className='main-title'>
        <form  className="input-group box-shadow" action="/department" method="get">

        <div className="input-group box-shadow">

            <input type="text" name="department" className="input" placeholder="Search by department here"
                id="" />
            <button type="submit" className="btn btn--accent"> Search </button>
  
        </div>
        </form>
        
        </div>
        <LazyLoadComponent>

        <div className='main-cards-roommates'>
            {displayUsers}

         
        </div>
        </LazyLoadComponent>
        <div className='agent-footer'>
        <button className='agent-button'>
          <BsFileEarmarkPerson className='card_icon' />
          Upload Roommate
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




