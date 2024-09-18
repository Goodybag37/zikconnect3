import React from 'react'
import {quotes} from '../assets'

const FeedbackCard = ({ content, name, title, img }) => {
  return (
    <div className='flex justify-between flex-col px-10 py-12 rounded-[20px] max-w-[300px] md:mr-10 sm:mr-5 mr-0 my-5 feedback-card'>
      <img  src={quotes} alt='doublle_quotes' className='w-[42px] h-[27px] object-contain'/>
      <p className='font-poppins font-normal text[10px] leading-[32px] text-white my-10 {content}'>{content}</p>
      <div className='flex flex-row'>
      <img src={img} alt={name} className='tailwind w-[40px] h-[48px] rounded-full' />
      <div className='flex flex-col ml-4'>
      <h4 className='tailwind font-poppins font-semibold text-[20px] leading-[32px] text-white'>
        {name}
      </h4>
      <p className='tailwind font-poppins font-normal text-[16px] leding-[24px] text-dimWhite my-10'> {title}</p>

      </div>
    </div>
    </div>
  )
}

export default FeedbackCard
