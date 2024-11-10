import React from "react";
// Assuming the CSS above is saved in Ticker.css

const Ticker = () => {
  const items = [
    "Buy and Sell your properties",
    "Rent Lodges",
    "Order a delivery",
    "Buy food from a nearby agent",
    "Contact a cybercafe",
    "Get the latest events happening around school",
    "Contact a keke/okada rider",
    "Repair your home appliances",
    "Join a whatsapp tv",
    "And lots more services",
  ];

  return (
    <div className="ticker-wrapper bg-blue-gradient">
      <div className="ticker-content">
        {items.map((item, index) => (
          <div key={index} className="ticker-item">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ticker;
