import { createContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    id: null,
    full_name: null,
    email: null,
    phoneNumber: null,
    isIdVerified: true,
    isPhoneVerified: false,
  });

  const login = (userData) => {
    console.log("Login Function Called with:", userData);
    setIsAuthenticated(true);
    setUser({
      ...userData,
      id: userData.userId,
      email: userData.email,
      full_name: userData.full_name,
      isIdVerified: userData.isIdVerified || true,
      isPhoneVerified: userData.isPhoneVerified || false,
    });

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...userData,
        isIdVerified: userData.isIdVerified || false,
        isPhoneVerified: userData.isPhoneVerified || false,
      })
    );
    localStorage.setItem("isAuthenticated", true);
    console.log("State After Login:", {
      isAuthenticated: true,
      user: {
        ...userData,
        isIdVerified: userData.isIdVerified || false,
        isPhoneVerified: userData.isPhoneVerified || false,
      },
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser({
      id: null,
      email: null,
      phoneNumber: null,
      isIdVerified: false,
      isPhoneVerified: false,
    });
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        setUser,
        setIsAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
