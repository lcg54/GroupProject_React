import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
import ProductList from '../pages/product/ProductList';
import Product from '../pages/product/Product';
import InquiryList from './../pages/InquiryList';
import InquiryWrite from './../pages/InquiryWrite';
import ReviewList from '../pages/ReviewList';
import MyPage from "../pages/mypage/MyPage";
import CartList from "../pages/CartList";
import RentalCompleted from "../pages/RentalCompleted";
import AdminProductRegister from "../pages/AdminProductRegister";
import Login from "../pages/Login";

import AuthPage from './../pages/AuthPage';  // 통합 페이지
import LogoutPage from './../pages/LogoutPage';
import EditPage from './../pages/EditPage';
import DrawalPage from './../pages/DrawalPage';

export default function AppRoutes({ handleLoginSuccess, logout, user, setUser }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product/list" element={<ProductList user={user} />} />
      <Route path="/product/:id" element={<Product user={user} />} />
      <Route path="/inquiry/list" element={<InquiryList />} />
      <Route path="/inquiry/write" element={<InquiryWrite />} />
      <Route path="/review" element={<ReviewList />} />
      <Route path="/mypage" element={<MyPage user={user} />} />
      <Route path="/cart" element={<CartList user={user} />} />
      <Route path="/rental/done" element={<RentalCompleted user={user} />} />
      <Route path="/admin/product/register" element={<AdminProductRegister />} />
      <Route path="/login" element={<Login user={user} setUser={setUser} />} />

      {/* 로그인/회원가입을 하나의 페이지로 통합 */}
      <Route path="/member/login" element={<AuthPage setUser={handleLoginSuccess} />} />
      <Route path="/member/signup" element={<AuthPage setUser={handleLoginSuccess} />} />

      <Route path="/member/logout" element={<LogoutPage onLogout={logout} />} />
      <Route path="/member/edit" element={<EditPage user={user} setUser={setUser} />} />
      <Route path="/member/drawal" element={<DrawalPage user={user} onLogout={logout} />} />
    </Routes>
  );
}