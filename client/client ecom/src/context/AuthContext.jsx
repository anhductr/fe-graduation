import { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["user"],
        queryFn: authApi.getMyInfo,
        enabled: !!token,
        retry: false,
        select: (data) => data.data.result,
        onError: () => {
            // Token invalid or expired
            logout();
        }
    });

    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            const { token } = data.data.result; // Backend trả ApiResponse { result: { token } }
            localStorage.setItem("token", token);
            setToken(token);
            // Invalidate user query to fetch profile
            queryClient.invalidateQueries(["user"]);
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

    const sendOtpMutation = useMutation({
        mutationFn: authApi.sendVerifyEmailOtp,
        onError: (error) => console.error("Send OTP failed:", error),
    });

    const verifyOtpMutation = useMutation({
        mutationFn: authApi.verifyOtp,
        onSuccess: () => {
            // Invalidate user query to refresh verification status
            queryClient.invalidateQueries(["user"]);
        },
        onError: (error) => console.error("Verify OTP failed:", error),
    });

    const logoutMutation = useMutation({
        mutationFn: authApi.logout,
        onSettled: () => {
            localStorage.removeItem("token");
            setToken(null);
            queryClient.clear();
            delete axios.defaults.headers.common["Authorization"];
        },
    });

    const logout = () => {
        if (token) {
            logoutMutation.mutate(token);
        } else {
            localStorage.removeItem("token");
            setToken(null);
            queryClient.clear();
        }
    };

    const value = {
        token,
        isLoggedIn: !!token,
        isLoggedIn: !!token,
        user: user,
        isUserLoading,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        isLoginLoading: loginMutation.isPending,
        isRegisterLoading: registerMutation.isPending,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
        sendOtp: sendOtpMutation.mutateAsync,
        verifyOtp: verifyOtpMutation.mutateAsync,
        isSendOtpLoading: sendOtpMutation.isPending,
        isVerifyOtpLoading: verifyOtpMutation.isPending,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};