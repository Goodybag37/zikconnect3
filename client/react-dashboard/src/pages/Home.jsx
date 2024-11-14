import React, { useEffect } from "react";
import "../customStyles.css";
import styles from "../style";
import Navbar from "../components/Navbar";
import Stat from "../components/Stat";
import Hero from "../components/Hero";
import Business from "../components/Business";
import Billing from "../components/Billing";
import CardDeal from "../components/CardDeal";
import Testimonial from "../components/Testimonial";
import Client from "../components/Client";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import TawkTo from "../components//TawkTo";
import Ticker from "../components//Ticker";
import "../App.css";

const Home = () => {
  const getReferralCodeFromURL = (paramName) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
  };
  useEffect(() => {
    const referralCode = getReferralCodeFromURL("ref_code");
    if (referralCode) {
      localStorage.setItem("referralCode", referralCode);
      console.log(`Referral code ${referralCode} stored in local storage.`);
    }
  }, []); // Empty dependency array ensures this runs only on mount

  return (
    <div className="bg-primary tailwind w-full  overflow-hidden">
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </div>
      </div>
      <div className={`bg-primary  ${styles.flexStart}`}>
        <div className={`${styles.boxWidth}`}>
          <Hero />
        </div>
      </div>
      <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <TawkTo />
          <Stat />
          <Business />
          <Billing />
          <CardDeal />
          <Testimonial />
          <Client />
          <CTA />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
