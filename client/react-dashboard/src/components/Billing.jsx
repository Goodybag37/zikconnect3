import React from 'react';
import {apple, bill, bill4, google} from '../assets';
import styles, {layout} from '../style';

const Billing = () => {
  return (
    <section id='product' className={layout.sectionReverse}>
    <div className={layout.sectionImgReverse}>
    <img src={bill } alt='billing' className=' w-[100%] h-[100%] relative z-[5]' />

    <div className='absoslute z-[3] -left-1/2 top-0 w-[50%] h-[50%] rounded-full white__gradient ' />
    <div className='absoslute z-[3] -left-1/2 bottom-0 w-[50%] h-[50%] rounded-full pink__gradient '/>

  

    </div>
    <div className={layout.sectionInfo}>
    <h2 className={styles.heading2}>
    Easily pay up  your <br className='sm:block hidden'/> School fees & ICT 

    </h2>
    <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
    Generate remita and pay your school fees through one of our agents 
    be rest assured zikconnect would be fully responsible for any loss from paying your fees 
    through our platform as we guarantee 100% safety 

    </p>
    <div className='flex flex-row flex-wrap sm:mt-10 mt-6'>
      <img src={ apple } alt='apple_store'
       className='w-[128px] h-[128px] object-contain mr-5 cursor-pointer'/>
      <img src={ google } alt='apple_store'
       className='w-[128px] h-[128px] object-contain mr-5 cursor-pointer'/>
    </div>

    </div>

    </section>
  )
}

export default Billing
