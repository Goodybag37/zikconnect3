import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState({
    id: null,
    full_name: null,
    email: null,
    phoneNumber: null,
    account_balance: null,
    isIdVerified: true,
    isPhoneVerified: false,
    isEmailVerified: false,
  });

  useEffect(() => {
    // Check localStorage for user info
    const userData = localStorage.getItem("user");
    const localAuthenticated = localStorage.getItem("isAuthenticated");

    if (localAuthenticated === true) {
      setIsAuthenticated(true);
      setUser({
        ...userData,
        id: userData.userId,
        email: userData.email,
        full_name: userData.full_name,
        account_balance: userData.account_balance,
        isIdVerified: userData.isIdVerified || true,
        isPhoneVerified: userData.isPhoneVerified || false,
        isEmailVerified: userData.isEmailVerified || false,
      });
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", true);
    setIsAuthenticated(true);
    setUser({
      ...userData,
      id: userData.userId,
      email: userData.email,
      full_name: userData.full_name,
      account_balance: userData.account_balance,
      isIdVerified: userData.isIdVerified || true,
      isPhoneVerified: userData.isPhoneVerified || false,
      isEmailVerified: userData.isEmailVerified || false,
    });

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...userData,
        isIdVerified: userData.isIdVerified || false,
        isPhoneVerified: userData.isPhoneVerified || false,
        isEmailVerified: userData.isEmailVerified || false,
      })
    );
    localStorage.setItem("isAuthenticated", true);
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
    localStorage.removeItem("reviewFormVisible");
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
