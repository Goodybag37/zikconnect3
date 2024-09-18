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
  const [lodges, setlodges] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;

  const displayUsers = lodges.map(createCard);
  

  const fetchData = async (page) => {
    try {
      const response = await axios.get(`http://localhost:4000/lodgeapi?page=${page + 1}&pageSize=${usersPerPage}`);
      console.log(response)
      const { lodges: newlodges, totalPages: newTotalPages } = response.data;
      setlodges(newlodges);
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

  function createCard(lodge) {
    return (
      
            <div className='card-lodge'>
                <div className='card-inner'>
                 <div  key={lodge.id}>
               <ul className='roommate-list-head'>
                    
               <li>
                <div className='profilePic'>
                  <div className = 'profileHeader'>
                  <p className= 'profileInfo'> User: {lodge.fk_user_id}</p>
                  <p className= 'profileInfo'> Lodge:  {lodge.id} </p>


                  </div>


                </div>

               </li>
                    <li className='roommate-list'>
                        Name: {lodge.name}
                    </li>
                     <li className='roommate-list'>
                        Description: {lodge.description}
                     </li>
                     <li className='roommate-list'>
                        Location: {lodge.location}
                     </li>
                     
                     <li className='roommate-list'>
                         Phone: {lodge.contact}
                 </li>
                     <li className='roommate-list'>
                     <a href='https://wa.me/{lodge.contact}'>
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
        <form  className="input-group box-shadow" action="/item" method="get">

        <div className="input-group box-shadow">

            <input type="text" name="department" className="input" placeholder="Search for item here"
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
          Upload a Lodge
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
