import React from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
    role: string; // Role yang dibutuhkan untuk akses
    allowedRoles: string[]; // Role yang diizinkan
    children: React.ReactNode; // Komponen anak
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role, allowedRoles, children }) => {
    const navigate = useNavigate();
    if (!allowedRoles.includes(role)) {
        navigate('/');
        return <Navigate to="/" replace />; // Redirect jika role tidak sesuai
    }
    return <>{children}</>;
};

export default ProtectedRoute;
