import { createContext, useContext, useState } from "react";
import axios from "axios";

const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const isAuthenticated = !!token;

  const login = async (username, password) => {
    try {
      const res = await axios.post(
        "/api/v1/user-service/auth/login",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token } = res.data.result;

      setToken(token);
      localStorage.setItem("token", token);

      return true;
    } catch (error) {
      throw new Error("Sai username hoặc password");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <LoginContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export const useLoginContext = () => useContext(LoginContext);
