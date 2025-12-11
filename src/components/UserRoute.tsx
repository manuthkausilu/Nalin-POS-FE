import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

const UserRoute = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const { isAuthenticated, user  } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user is an admin, redirect them to admin dashboard
    if (user?.role === 'Admin') {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};

export default UserRoute;
