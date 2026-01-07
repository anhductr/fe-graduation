import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useLoginContext } from "../../context/LoginContext";

export default function ProtectedRoute({ children }) {
    const { token } = useLoginContext();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
}
