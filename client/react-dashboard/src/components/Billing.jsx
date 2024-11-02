import React from "react";
import { apple, bill, bill4, google } from "../assets";
import styles, { layout } from "../style";

const Billing = () => {
  return (
    <section id="product" className={layout.sectionReverse}>
      <div className={layout.sectionImgReverse}>
        <img
          src={bill}
          alt="billing"
          className=" w-[100%] h-[100%] relative z-[5]"
        />

        <div className="absoslute z-[3] -left-1/2 top-0 w-[50%] h-[50%] rounded-full white__gradient " />
        <div className="absoslute z-[3] -left-1/2 bottom-0 w-[50%] h-[50%] rounded-full pink__gradient " />
      </div>
      <div className={layout.sectionInfo}>
        <h2 className={styles.heading2}>
          Sell <br className="sm:block hidden" /> Your Property
        </h2>
        <p className={`${styles.paragraph} text-gradient max-w-[470px] mt-5`}>
          Easily Sell out your Properties to other students by uploading them on
          our website. We do not mediate the sales therfore buyers pay directly
          to the sellers without extra charges from zikconnect
        </p>
        <div className="flex flex-row flex-wrap sm:mt-10 mt-6">
          <img
            src={apple}
            alt="apple_store"
            className="w-[128px] h-[128px] object-contain mr-5 cursor-pointer"
          />
          <img
            src={google}
            alt="apple_store"
            className="w-[128px] h-[128px] object-contain mr-5 cursor-pointer"
          />
        </div>
      </div>
    </section>
  );
};

export default Billing;
