import React from "react";
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
import "../App.css";

const Home = () => {
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
