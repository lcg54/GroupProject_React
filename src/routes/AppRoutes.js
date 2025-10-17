import { Route, Routes } from "react-router-dom";

import HomePage from './../pages/HomePage';
import SignupPage from './../pages/SignupPage';
import LoginPage from './../pages/LoginPage';
import LogoutPage from './../pages/LogoutPage';
import EditPage from './../pages/EditPage';
import DrawalPage from './../pages/DrawalPage';

export default function AppRoutes({ handleLoginSuccess, logout, user, setUser }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/member/signup" element={<SignupPage />} />
      <Route path="/member/login" element={<LoginPage setUser={handleLoginSuccess} />} />
      <Route path="/member/logout" element={<LogoutPage onLogout={logout} />} />
      <Route path="/member/edit" element={<EditPage user={user} setUser={setUser} />} />
      <Route path="/member/drawal" element={<DrawalPage onLogout={logout} />} />

    </Routes>
  );
}