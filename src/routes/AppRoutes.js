import { Route, Routes } from "react-router-dom";

import HomePage from './../pages/HomePage';
import AuthPage from './../pages/AuthPage';  // 통합 페이지
import LogoutPage from './../pages/LogoutPage';
import EditPage from './../pages/EditPage';
import DrawalPage from './../pages/DrawalPage';

export default function AppRoutes({ handleLoginSuccess, logout, user, setUser }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* 로그인/회원가입을 하나의 페이지로 통합 */}
      <Route path="/member/login" element={<AuthPage setUser={handleLoginSuccess} />} />
      <Route path="/member/signup" element={<AuthPage setUser={handleLoginSuccess} />} />

      <Route path="/member/logout" element={<LogoutPage onLogout={logout} />} />
      <Route path="/member/edit" element={<EditPage user={user} setUser={setUser} />} />
      <Route path="/member/drawal" element={<DrawalPage user={user} onLogout={logout} />} />
    </Routes>
  );
}