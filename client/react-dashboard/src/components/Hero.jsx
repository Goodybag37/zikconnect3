import React from "react";
import styles from "../style";
import GetStarted from "./GetStarted";
import { discount, robot } from "../assets";
import { BsFillPersonFill, BsLockFill } from "react-icons/bs";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      id="home"
      className={`flex md:flex-row flex-col ${styles.paddingY}`}
    >
      <div
        className={`flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6`}
      >
        {/* Discount Banner */}
        <div className="flex flex-row items-center py-[6px] px-4 bg-discount-gradient rounded-[10px] mb-2 mt[-20px]">
          <img src={discount} alt="discount" className="w-[32px] h-[32px]" />
          <p className={`${styles.paragraph} ml-2`}>
            <span className="text-white">Get</span> 2000 Naira {""}
            <span className="text-white">On registeration!!</span>
          </p>
        </div>

        {/* Main Heading */}
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center w-full">
          <h1 className="flex-1 font-poppins font-semibold text-[52px] md:text-[72px] text-white leading-[75px] md:leading-[100px] text-center md:text-left">
            The Next <br className="sm:block hidden" />
            <span className="text-gradient">Generation</span>
          </h1>
        </div>

        {/* Sub Heading */}
        <h1 className="font-poppins font-semibold text-[40px] md:text-[68px] text-white mt-[-10px] leading-[75px] md:leading-[100px] w-full text-center md:text-left">
          Unizik Students
        </h1>

        {/* Description */}
        <p className={`${styles.paragraph} text-gradient max-w-[470px] mt-5`}>
          A platform where students can buy and sell properties, run delivery,
          rent a lodge, buy food, and lots more...
        </p>

        <div className="getStartedContainer flex flex-row mt-8">
          <Link to="/register">
            <button className="bg-blue-gradient getStartedButton ">
              <BsFillPersonFill className="connect_icon" /> Get Started
            </button>
          </Link>
          <Link to="/login">
            <button className="loginButton "> Login</button>
          </Link>
          {/* <div className="ss:flex  md:mr-4 mr-0">
          <GetStarted />
        </div> */}
        </div>
      </div>

      {/* Right Section with Image and Gradients */}
      <div
        className={`flex-1 flex ${styles.flexCenter} md:my-0 my-10 relative`}
      >
        <img
          src={robot}
          alt="robot"
          className="w-[100%] h-[100%] relative z-[5]"
        />

        {/* Gradient Overlays */}
        <div className="absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient" />
        <div className="absolute z-[1] w-[80%] h-[80%] rounded-full white__gradient bottom-40" />
        <div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient" />
      </div>
    </section>
  );
};

export default Hero;
