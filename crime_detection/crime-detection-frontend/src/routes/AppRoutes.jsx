import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Onboarding from "../pages/Onboarding/Onboarding";
import CameraSetup from "../pages/CameraSetup/CameraSetup";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import History from "../pages/History/History";
// import Alerts from "../pages/Alerts/Alerts";
// import Settings from "../pages/Settings/Settings";
import Profile from "../pages/Profile/Profile";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/camera-setup" element={<CameraSetup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/history" element={<History />} />
      {/* <Route path="/alerts" element={<Alerts />} /> */}
      {/* <Route path="/settings" element={<Settings />} /> */}
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}