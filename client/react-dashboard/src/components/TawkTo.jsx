import React, { useEffect } from "react";

const TawkTo = () => {
  useEffect(() => {
    // Check if the script is already added to avoid duplication
    if (!window.Tawk_API) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://embed.tawk.to/672fea654304e3196adfb91b/1ic9in7q4";
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");
      document.body.appendChild(script);

      // Optional: You can set some Tawk.to settings if needed
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();
    }
  }, []);

  return null; // This component does not render any UI
};

export default TawkTo;
