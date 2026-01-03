import { createContext, useContext, useState } from "react";
import axios from "axios";

const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    const login = async (username, password) => {
        try {
            const res = await axios.post(
                "/api/v1/user-service/auth/login",
                { username, password },
                { headers: { "Content-Type": "application/json" } }
            );

            const data = res.data; // axios tự parse JSON
            console.log("data:", data);

            // setUser(data.user);
            setToken(data.result.token);
            localStorage.setItem("token", data.result.token);
            // localStorage.setItem("user", JSON.stringify(data.user));

            return data.user;
        } catch (error) {
            console.error("Login error:", error);
            throw new Error("Sai username hoặc password");
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <LoginContext.Provider value={{ user, token, login, logout }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLoginContext = () => useContext(LoginContext);
