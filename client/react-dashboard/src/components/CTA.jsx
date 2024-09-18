import React from 'react'
import styles from '../style'
import Button from './Button'
import CustomLink from './CustomLink';
import { Link, useLocation } from 'react-router-dom';

const CTA = () => {
  return (
   <section className={` ${styles.flexCenter} ${styles.marginY} ${styles.padding} 
   sm:flex-row flex-col bg-black-gradient-2 rounded-[20px] box-shadow`}>
    <div className='tailwind flex-1 flex flex-col'>
      <h2 className={`${styles.heading2} tailwind`}>
        Lets try our service now!
      </h2> 
      <p className={`${styles.paragraph}  max-w-[470px] mt-5`}>
        Everything you need about connecting with students 
        and getting things done from the comfort of your 
        room.
      </p>
    </div>
    <div className={`${styles.flexCenter} sm:ml-10 ml-0 sm:mt-0 mt-10`}>
  
   
    <CustomLink className='card-title' to={'/login'} >
    <Button />
              </CustomLink>
     
    </div>

   </section>
  )
}

export default CTA
