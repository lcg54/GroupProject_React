import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
import MyPage from "../pages/mypage/MyPage";

import ProductList from '../pages/product/ProductList';
import Product from '../pages/product/Product';

import InquiryList from './../pages/InquiryList';
import InquiryWrite from './../pages/InquiryWrite';

import ReviewList from '../pages/ReviewList';
import ReviewWrite from '../pages/ReviewWrite';

import CartList from "../pages/CartList";
import RentalCompleted from "../pages/RentalCompleted";

import ProductInsertForm from "../pages/ProductInsertForm";
import ProductUpdateForm from "../pages/ProductUpdateForm";

import AuthPage from './../pages/AuthPage';
import LogoutPage from './../pages/LogoutPage';
import EditPage from './../pages/EditPage';
// import DrawalPage from './../pages/DrawalPage';

export default function AppRoutes({ user, setUser, handleLogout }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mypage" element={<MyPage user={user} setUser={setUser} />} />
      
      <Route path="/product/list" element={<ProductList user={user} />} />
      <Route path="/product/:id" element={<Product user={user} />} />

      <Route path="/inquiry/list" element={<InquiryList />} />
      <Route path="/inquiry/write" element={<InquiryWrite />} />

      <Route path="/review/list" element={<ReviewList />} />
      <Route path="/review/write" element={<ReviewWrite />} />

      <Route path="/cart" element={<CartList user={user} />} />
      <Route path="/rental/done" element={<RentalCompleted user={user} />} />

      <Route path="/admin/product/register" element={<ProductInsertForm user={user} />} />
      <Route path="/admin/product/update/:id" element={<ProductUpdateForm user={user} />} />

      {/* 로그인/회원가입을 하나의 페이지로 통합 */}
      <Route path="/member/login" element={<AuthPage setUser={setUser} />} />
      <Route path="/member/signup" element={<AuthPage setUser={setUser} />} />

      <Route path="/member/logout" element={<LogoutPage onLogout={handleLogout} />} />
      {/* 정보 수정/회원 탈퇴를 하나의 페이지로 통합 */}
      <Route path="/member/edit" element={<EditPage user={user} setUser={setUser} />} />
      {/* <Route path="/member/drawal" element={<DrawalPage user={user} onLogout={handleLogout} />} /> */}
    </Routes>
  );
}