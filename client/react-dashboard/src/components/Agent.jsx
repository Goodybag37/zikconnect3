import React from 'react'
import { Link } from 'react-router-dom';
import { Routes, Route, useParams } from 'react-router-dom';
import CustomLink from './CustomLink';
import '../App.css';
import 
{ BsFillArchiveFill, BsFillPersonDashFill, BsFillPipFill,
   BsLaptop, BsPuzzleFill,BsInboxFill,BsFillDisplayFill,BsFolderSymlinkFill,
   BsLayersFill,BsFillCollectionFill, BsFillBootstrapFill, BsFillPeopleFill, 
   BsFillHouseDoorFill, BsBookHalf,
    BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill}
 from 'react-icons/bs'

 
 import 
 { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } 
 from 'recharts';

function Agent(props) {
  const { userId, email } = props
    const data = [
        {
          name: 'Page A',
          uv: 4000,
          pv: 2400,
          amt: 2400,
        },
        {
          name: 'Page B',
          uv: 3000,
          pv: 1398,
          amt: 2210,
        },
        {
          name: 'Page C',
          uv: 2000,
          pv: 9800,
          amt: 2290,
        },
        
        {
          name: 'Page D',
          uv: 2780,
          pv: 3908,
          amt: 2000,
        },
        {
          name: 'Page E',
          uv: 1890,
          pv: 4800,
          amt: 2181,
        },
        {
          name: 'Page F',
          uv: 2390,
          pv: 3800,
          amt: 2500,
        },
        {
          name: 'Page G',
          uv: 3490,
          pv: 4300,
          amt: 2100,
        },
      ];
     

  return (
    <main className='main-container'>
      
        <div className='main-cards'>
  <div className='card'>
    <div className='card-inner'>
    <h3 className='agent-icon'>
       <BsFillPipFill className='card_icon' />
       <CustomLink className='card-title' to={'/schoolfees'} userId={userId} email={email}>
                Pay School Fees
              </CustomLink>
      </h3>
      
    </div>
        <p> Generate remita and Pay your school fees in one click</p>
    <h1>0</h1>
  </div>
  <div className='card'>
    <div className='card-inner'>
    <h3 className='agent-icon'>
      <BsFillCollectionFill className='card_icon' />
      <CustomLink className='card-title' to={'/buysells'} userId={userId} email={email}>
                Buy/Sell Property
              </CustomLink>
      </h3>
      
    </div>
    <p>Buy and sell out properties from nearby students at a go</p>
    <h1>0</h1>
  </div>

  <div className='card'>
    <div className='card-inner'>
    <h3 className='agent-icon'>
      <BsFillPeopleFill className='card_icon' />
      <CustomLink className='card-title' to={'/roommates'} userId={userId} email={email}>
                Find a Roommate
              </CustomLink>
      </h3>
      
    </div>
    <p> Find roommates that suits your requirements from the list of options</p>
    <h1>0</h1>
  </div>
  <div className='card'>
    <div className='card-inner'>
    <h3 className='agent-icon'>
      <BsFillHouseDoorFill className='card_icon' />
      <CustomLink className='card-title' to={'/lodges'} userId={userId} email={email}>
                Rent a Lodge
              </CustomLink>
      </h3>
     
    </div>
    <p> Rent a lodge at any location of your choice around school</p>
    <h1>0</h1>
  </div>
  <div className='card'>
    <div className='card-inner'>
    <h3 className='agent-icon'>
      <BsBookHalf className='card_icon' />
      <CustomLink className='card-title' to={'/courses'} userId={userId} email={email}>
                Buy a Course
              </CustomLink>
      </h3>
      
    </div>
    <p>Learn a course from any of our trusted agents and kick off your career </p>
    <h1>0</h1>
  </div>
  <div className='card'>
    <div className='card-inner'>
    <h3 className='agent-icon'>
      <BsFillArchiveFill className='card_icon' />
      <CustomLink className='card-title' to={'/deliveries'} userId={userId} email={email}>
                Run Delivery
              </CustomLink>
      </h3>
     
    </div>
    <p> Book a dispatch rider for all your deliveries from tempsite to ifite</p>
    <h1>0</h1>
  </div>
  <div className='card'>
    <div className='card-inner'>
    <h3 className='agent-icon'>
      <BsFillBootstrapFill className='card_icon' />
      <CustomLink className='card-title' to={'/cryptos'} userId={userId} email={email}>
                Exchange Crypto
              </CustomLink>
      </h3>
      
    </div>
    <p>Buy and sell all crypto currencies from one of our trusted agents</p>
    <h1>0</h1>
  </div>
  <div className='card'>
    <div className='card-inner'>
    <h3 className='agent-icon'>
    <BsFillDisplayFill className='card_icon' />
    <CustomLink className='card-title' to={'/whatsapptvs'} userId={userId} email={email}>
                Whatsapp Tvs
              </CustomLink>
      </h3>
      
    </div>
    <p>Contact the best Unizik whatsapp Tvs for updates around school</p>
    <h1>0</h1>
  </div>
  <div className='card'>
    <div className='card-inner'>

    <h3 className='agent-icon'>
       <BsLaptop className='card_icon' />
       <CustomLink className='card-title' to={'/cybercafes'} userId={userId} email={email}>
                Cyber Cafe
              </CustomLink>
      </h3>
      
    </div>
    <p> Contact a Cyber cafe for  printing and online registrations</p>
    <h1>0</h1>
  </div>
  <div className='card'>
    <div className='card-inner'>
      <h3 className='agent-icon'>
      <BsInboxFill className='card_icon' />
      <CustomLink className='card-title' to={'/riders'} userId={userId} email={email}>
      Keke/Okada rider
              </CustomLink>
      </h3>
      
    </div>
    <p>Contact a keke or Okada rider to come pick you up at any location</p>
    <h1>0</h1>
  </div>

  {/* Continue the pattern for other cards... */}
</div>


        <div className='charts'>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pv" fill="#8884d8" />
                <Bar dataKey="uv" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>

        </div>
    </main>
  )
}

export default Agent