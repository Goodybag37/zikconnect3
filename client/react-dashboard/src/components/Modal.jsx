import React, { useEffect } from 'react';
import { BsXLg } from 'react-icons/bs';

const Modal = ({ show, onClose, content, timeoutDuration = 600000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
      localStorage.removeItem('showModal');
    }, timeoutDuration,); // Close after 10 minutes

    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, [show, onClose, timeoutDuration]);

  useEffect(() => {
    if (show) {
      localStorage.setItem('showModal', 'true');
    } 
  }, [show]);

  if (!show) return null;

  return (
    <div className='modal-overlay'>
      <div className='modal-content bg-black-gradient-2'>
        {/* <button className='popup-close' onClick={onClose}>
          <BsXLg />
        </button> */}
        {content}
      </div>
    </div>
  );
};

export default Modal;



