import { useAuthContext } from "@/contexts/AuthProvider";
import React, { useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: React.ReactNode;
};
export const ProtectedRouteAdmin: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const { user } = useAuthContext();
  const location = useLocation();

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const ProtectedRouteTeacher: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const { user } = useAuthContext();
  const location = useLocation();

  if (!user || user.role !== "teacher") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const ProtectedRouteUser: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const location = useLocation();
  useEffect(() => {
  }, [location]);

  return children;
};
