import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/Login";
import CommandCenter from "../pages/CommandCenter";
import CreatorStudio from "../pages/CreatorStudio";
import IdentityVault from "../pages/IdentityVault";
import PermissionMatrix from "../pages/PermissionMatrix";
import AuditChronicle from "../pages/AuditChronicle";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/studio" element={<CreatorStudio />} />
          <Route path="/vault" element={<IdentityVault />} />
          <Route path="/matrix" element={<PermissionMatrix />} />
          <Route path="/audit" element={<AuditChronicle />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
