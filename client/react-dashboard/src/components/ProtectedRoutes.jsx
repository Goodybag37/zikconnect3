// // PrivateRoute.js
// import React from 'react';
// import { Outlet, Navigate } from 'react-router-dom';

// const ProtectedRoutes = ()=> {
//     return user ? <Outlet /> : <Navigate to ="/login" />
// }

// export default ProtectedRoutes

// PrivateRoute.js
import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import AuthContext from "../AuthContext";

const userlo = localStorage.getItem("user");

console.log("user lo", userlo);

const ProtectedRoutes = ({ conditions = [], redirectPaths = {} }) => {
  const location = useLocation();
  const { isAuthenticated, user, login } = useContext(AuthContext);
  const isPhoneVerified = user.isPhoneVerified;
  const isIdVerified = user.isIdVerified;
  const localAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userData = JSON.parse(localStorage.getItem("user"));

  if (!isAuthenticated) {
    if (localAuthenticated === true) {
      login({
        ...userData,
        id: userData.userId,
        full_name: userData.full_name,
        email: userData.email,
        account_balance: userData.account_balance,
        isPhoneVerified: userData.phone || false,
        isIdVerified: userData.isIdVerified || true,
      });
    } else {
      return <Navigate to={`/login?redirect=${location.pathname}`} />;
    }
  }

  if (conditions.includes("id1") && isIdVerified) {
    return <Navigate to={redirectPaths.verifiedAgent || "/agents"} />;
  }

  if (conditions.includes("phone") && !isPhoneVerified) {
    return <Navigate to={redirectPaths.phone || "/verifyphone"} />;
  }

  if (conditions.includes("id") && !isIdVerified) {
    return <Navigate to={redirectPaths.id || "/verifyid"} />;
  }

  // If the user is authenticated, allow them to access the protected routes
  return <Outlet />;
};

export default ProtectedRoutes;

// // PrivateRoute.js
// import React from 'react';
// import { Outlet, Navigate } from 'react-router-dom';

// const ProtectedRoutes = ()=> {
//     return user ? <Outlet /> : <Navigate to ="/login" />
// }

// export default ProtectedRoutes

// PrivateRoute.js
// import React, { useContext } from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import AuthContext from "../AuthContext";

// // Function to check if the user is authenticated
// const isAuthenticated = () => {
//   // This function should check your authentication logic, e.g., checking for a token in localStorage or checking a global state
//   const token = localStorage.getItem("authToken"); // Example: checking local storage for a token
//   return !!token; // Returns true if the token exists, false otherwise
// };

// const userlo = localStorage.getItem("user");

// console.log("user lo", userlo);

// const ProtectedRoutes = ({ conditions = [], redirectPaths = {} }) => {
//   const location = useLocation();
//   const { isAuthenticated, isPhoneVerified, isIdVerified } =
//     useContext(AuthContext);

//   if (!isAuthenticated) {
//     console.log(isAuthenticated);
//     // If the user is not authenticated, redirect them to the login page and pass the current location
//     return <Navigate to={`/login?redirect=${location.pathname}`} />;
//   }

//   // If the user is authenticated, allow them to access the protected routes
//   return <Outlet />;
// };

// export default ProtectedRoutes;
