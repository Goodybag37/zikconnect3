// Popup.js
import React from "react";
import "../popup.css"; // Optional for styling

const Popup = ({ header, message, buttons, checkbox }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-box bg-black-gradient">
        <h2 className="text-gradient">{header}</h2>
        <p>{message}</p>

        <div className="popup-actions">
          {buttons.map((button, index) => (
            <button
              className="bg-blue-gradient roommate-button"
              key={index}
              onClick={button.onClick}
            >
              {button.label}
            </button>
          ))}
        </div>

        {checkbox && (
          <div className="popup-checkbox">
            <input
              type="checkbox"
              id="dontAskAgain"
              onChange={checkbox.onChange}
            />
            <label className="popup-checkboxLabel" htmlFor="dontAskAgain">
              {checkbox.label}
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
