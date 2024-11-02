import React from "react";
import { card } from "../assets";
import styles, { layout } from "../style";
import Button from "./Button";

const CardDeal = () => {
  return (
    <section className={layout.section}>
      <div className={layout.sectionInfo}>
        <h2 className={` text-gradient ${styles.heading2}`}>
          Become one of our agents <br className="sm:block hidden " /> in few
          easy steps
        </h2>
        <p className={` ${styles.paragraph} max-w-[470px] mt-5`}>
          You can become a zikconnect agent and advertise your business for
          students to contact you at a go. This opportunity is only available to
          individuals who operate within the school environment to ensure the
          safety of our students.
        </p>

        <Button styles="mt-10" />
      </div>
      <div className={layout.sectionImg}>
        <img src={card} alt="card" className=" w-[100%] h-[100%]" />
      </div>
    </section>
  );
};

export default CardDeal;
