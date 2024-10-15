import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Routes, Route, useParams } from "react-router-dom";
import CustomLink from "./CustomLink";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";
import {
  BsFillArchiveFill,
  BsFillPersonDashFill,
  BsFillPipFill,
  BsLaptop,
  BsPuzzleFill,
  BsInboxFill,
  BsFillDisplayFill,
  BsFolderSymlinkFill,
  BsLayersFill,
  BsFillCollectionFill,
  BsFillBootstrapFill,
  BsFillPeopleFill,
  BsFillHouseDoorFill,
  BsBookHalf,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsFillBellFill,
} from "react-icons/bs";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

function Agent(props) {
  const [totalAgents, setTotalAgents] = useState({
    courseagents: 0,
    repairagents: 0,
    cybercafeagents: 0,
    deliveryagents: 0,
    rideragents: 0,
    whatsapptvagents: 0,
    schoolfeeagents: 0,
  });

  const apiUrl = "http://localhost:4000";

  // Fetch data and manually assign values
  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/total-connect/`);
        const data = response.data;

        // Create a new object to hold total values
        const newTotalAgents = { ...totalAgents };

        // Manually target and assign data
        data.forEach((agent) => {
          newTotalAgents[agent.agent_type] = agent.total_connect;
        });

        // Update the state with the new total values
        setTotalAgents(newTotalAgents);
      } catch (error) {
        console.error("Error fetching totals:", error);
      }
    };

    fetchTotals();
  }, []); // Empty dependency array to run only on mount

  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };
  const { userId, email } = props;
  const data = [
    {
      name: "Page A",
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Page B",
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: "Page C",
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },

    {
      name: "Page D",
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: "Page E",
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: "Page F",
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: "Page G",
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  return (
    <main className="main-container">
      <div className="main-cards">
        <div
          className="card cursor-pointer"
          onClick={() => navigateTo("/schoolfees")}
        >
          <div className="card-inner">
            <h3 className="agent-icon text-gradient">
              <BsFillPipFill className="card_icon" />
              <CustomLink
                className="card-title"
                to={"/schoolfees"}
                userId={userId}
                email={email}
              >
                Pay School Fees
              </CustomLink>
            </h3>
          </div>
          <p> Generate remita and Pay your school fees in one click.</p>
          <h4 className="text-gradient">
            {totalAgents.schoolfeeagents} connects
          </h4>
        </div>
        <div
          className="card cursor-pointer"
          onClick={() => navigateTo("/buysells")}
        >
          <div className="card-inner">
            <h3 className="agent-icon text-gradient">
              <BsFillCollectionFill className="card_icon" />
              <CustomLink
                className="card-title"
                to={"/buysells"}
                userId={userId}
                email={email}
              >
                Buy/Sell Property
              </CustomLink>
            </h3>
          </div>
          <p>Buy and sell out properties from nearby students at a go.</p>
          <h4 className="text-gradient">0</h4>
        </div>

        <div
          className="card cursor-pointer"
          onClick={() => navigateTo("/repairs")}
        >
          <div className="card-inner">
            <h3 className="agent-icon text-gradient">
              <BsFillPeopleFill className="card_icon" />
              <CustomLink
                className="card-title"
                to={"/repairs"}
                userId={userId}
                email={email}
              >
                Repair Item
              </CustomLink>
            </h3>
          </div>
          <p>
            {" "}
            Repair your various home appliances by contacting our trusted
            agents.{" "}
          </p>
          <h4 className="text-gradient">{totalAgents.repairagents} connects</h4>
        </div>
        <div
          className="card cursor-pointer"
          onClick={() => navigateTo("/lodges")}
        >
          <div className="card-inner">
            <h3 className="agent-icon text-gradient">
              <BsFillHouseDoorFill className="card_icon" />
              <CustomLink
                className="card-title"
                to={"/lodges"}
                userId={userId}
                email={email}
              >
                Rent a Lodge
              </CustomLink>
            </h3>
          </div>
          <p> Rent a lodge at any location of your choice around school</p>
          <h4 className="text-gradient">0</h4>
        </div>
        <div
          className="card cursor-pointer"
          onClick={() => navigateTo("/courses")}
        >
          <div className="card-inner">
            <h3 className="agent-icon text-gradient">
              <BsBookHalf className="card_icon" />
              <CustomLink
                className="card-title"
                to={"/courses"}
                userId={userId}
                email={email}
              >
                Buy a Course
              </CustomLink>
            </h3>
          </div>
          <p>
            Learn a course from any of our trusted agents and kick off your
            career.{" "}
          </p>
          <h4 className="text-gradient">{totalAgents.courseagents} connects</h4>
        </div>
        <div
          className="card cursor-pointer"
          onClick={() => navigateTo("/deliveries")}
        >
          <div className="card-inner">
            <h3 className="agent-icon text-gradient">
              <BsFillArchiveFill className="card_icon" />
              <CustomLink
                className="card-title"
                to={"/deliveries"}
                userId={userId}
                email={email}
              >
                Run Delivery
              </CustomLink>
            </h3>
          </div>
          <p>
            {" "}
            Book a dispatch rider for all your deliveries from tempsite to
            ifite.
          </p>
          <h4 className="text-gradient">
            {totalAgents.deliveryagents} connects
          </h4>
        </div>
        <div
          className="card cursor-pointer"
          onClick={() => navigateTo("/whatsapptvs")}
        >
          <div className="card-inner">
            <h3 className="agent-icon text-gradient">
              <BsFillDisplayFill className="card_icon" />
              <CustomLink
                className="card-title"
                to={"/whatsapptvs"}
                userId={userId}
                email={email}
              >
                Whatsapp Tvs
              </CustomLink>
            </h3>
          </div>
          <p>Contact the best Unizik whatsapp Tvs for updates around school.</p>
          <h4 className="text-gradient">
            {totalAgents.whatsapptvagents} connects
          </h4>
        </div>
        <div
          className="card cursor-pointer"
          onClick={() => navigateTo("/cybercafes")}
        >
          <div className="card-inner">
            <h3 className="agent-icon text-gradient">
              <BsLaptop className="card_icon" />
              <CustomLink
                className="card-title"
                to={"/cybercafes"}
                userId={userId}
                email={email}
              >
                Cyber Cafe
              </CustomLink>
            </h3>
          </div>
          <p> Contact a Cyber cafe for printing and online registrations.</p>
          <h4 className="text-gradient">
            {totalAgents.cybercafeagents} connects
          </h4>
        </div>
        <div
          className="card cursor-pointer"
          onClick={() => navigateTo("/riders")}
        >
          <div className="card-inner">
            <h3 className="agent-icon text-gradient">
              <BsInboxFill className="card_icon" />
              <CustomLink
                className="card-title"
                to={"/riders"}
                userId={userId}
                email={email}
              >
                Keke/Okada rider
              </CustomLink>
            </h3>
          </div>
          <p>
            Contact a keke or Okada rider to come pick you up at any location.
          </p>
          <h4 className="text-gradient">{totalAgents.rideragents} connects</h4>
        </div>

        {/* Continue the pattern for other cards... */}
      </div>

      <div className="charts">
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
            <Line
              type="monotone"
              dataKey="pv"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}

export default Agent;
