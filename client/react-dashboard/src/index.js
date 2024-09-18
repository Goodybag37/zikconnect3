import React from "react";
import { createRoot } from "react-dom/client"; // Correct import for createRoot
import { BrowserRouter as Router } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./components/App.jsx";
import { AuthProvider } from "./AuthContext.js";
import { UserProvider } from "./UserContext.js";

const domain = "dev-t8fkqfdgjw48vksz.us.auth0.com";
const clientId = "SVZRzxm9CC6lAN8ZtbT77epGZxLVKesK";

const root = createRoot(document.getElementById("root")); // Use createRoot
root.render(
  // <Auth0Provider
  //   domain={domain}
  //   clientId={clientId}
  //   redirectUri={window.location.origin}
  // >
  <Router>
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  </Router>
  // </Auth0Provider>
);

// ReactDOM.render(<Auth0Provider
//   domain="dev-t8fkqfdgjw48vksz.us.auth0.com"
//   clientId="SVZRzxm9CC6lAN8ZtbT77epGZxLVKesK"
//   redirectUrl={window.location.origin}>
//     <React.StrictMode>
//     <Router>
//       <App />
//     </Router>
//   </React.StrictMode>

//   </Auth0Provider>,
//   document.getElementById('root')
// )
