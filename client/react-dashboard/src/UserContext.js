import React, { createContext, useState } from "react";

const UserContext = createContext({
  profile: {
    user: null,
    isPhoneVerified: false,
    isIDVerified: false,
  },
  setProfile: () => {},
});

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);

  return (
    <UserContext.Provider value={{ profile, setProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
