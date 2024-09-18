import React from 'react';
import styles from '../style'
import GetStarted from './GetStarted'

import {discount, robot } from '../assets';

const Hero = () => {
  return(
    <section id='home' className={`tailwind flex md:flex-row flex-col ${styles.paddingY}`}>
      <div className={`flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6`}>
        <div className='flex flex-row items-center py-[6px] px-4 bg-discount-gradient rounded-[10px] mb-2'>
        <img src={discount} alt='discount' className='w-[32px] h-[32px]'/>
        <p className={`${styles.paragraph} tailwind ml-2`}>
        <span className='text-white '>
          20%
        </span> Discount For {""}
        <span className='text-white'>
          1 Month
        </span> Account

        </p>
         </div>
        <div className='flex  flex-row justify-between 
        items-center w-full'>
        <h1 className='flex-1 tailwind   font-poppins
         font-semibold ss:text-[72px] text-[52px] text-white
          ss:leading-[100px] leading-[75px]'>
          The Next <br className='sm:block hidden'/>{''}
          <span 
          className='text-gradient'>Generation</
          span> {''} 
          
        </h1>
        <div className='ss:flex hidden md:mr-4 mr-0'>
              <GetStarted />
        </div>

        </div>
        <h1 className=' tailwind   font-poppins
         font-semibold ss:text-[68px]
         text-[52px] text-white ss:leading-[100px] 
         leading-[75px] w-full'>Unizik Students</h1>
         <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          A platform where students can buy and sell properties, get a roommate, rent a lodge,
           and lots more...
         </p>
      </div>
   <div>
        <img src={robot} className=' w-[100%] h-[100%]
         relative z-[] '/>
         <div className='absolute z-[0] w-[40%] h-[35%] 
         top-[0] pink__gradient'/>
         <div className='absolute z-[1] w-[80%] h-[80%] 
         bottom-[40] rounded-full white__gradient'/>
         <div className='absolute z-[0] w-[50%] h-[50%] 
         top-[0] right-[20] bottom-[20] blue__gradient' />

         </div>
         
    </section>

  )
  
}

export default Hero
