import { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { authApi } from "../services/authApi";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [token]);

    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            const { token } = data.data.result; // Backend trả ApiResponse { result: { token } }
            localStorage.setItem("token", token);
            setToken(token);
        },
        onError: (error) => console.error("Login failed:", error),
    });

    const registerMutation = useMutation({
        mutationFn: authApi.register,
        // onSuccess: () => {
        //     queryClient.invalidateQueries(["user"]);
        // },
        onError: (error) => {
            // IN CHI TIẾT LỖI RA CONSOLE
            console.error("REGISTER ERROR DETAILS:");
            console.error("→ Status:", error.response?.status);
            console.error("→ Code:", error.response?.data); // USER_PASSWORD_INVALID
            console.error("→ Full Response:", error.response);
            console.error("→ Request Config:", error.config);
            console.error("→ Full Error Object:", error);
        },
    });

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        queryClient.clear();
    };

    const value = {
        token,
        isLoggedIn: !!token,
        user: queryClient.getQueryData(["user"]),
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        isLoginLoading: loginMutation.isPending,
        isRegisterLoading: registerMutation.isPending,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};