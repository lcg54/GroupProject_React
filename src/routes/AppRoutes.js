import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
import MyPage from "../pages/mypage/MyPage";

import ProductList from '../pages/product/ProductList';
import Product from '../pages/product/Product';
import CartList from "../pages/cart/CartList";
import Receipt from "../pages/mypage/Receipt";

import AdminRentalListPage from "../pages/admin/AdminRentalListPage";
import SalesHistory from '../pages/admin/SalesHistory';
import ProductInsertForm from "../pages/admin/ProductInsertForm";
import ProductUpdateForm from "../pages/admin/ProductUpdateForm";

import InquiryList from './../pages/InquiryList';
import InquiryWrite from './../pages/InquiryWrite';
import ReviewList from '../pages/ReviewList';
import ReviewWrite from '../pages/ReviewWrite';

import AuthPage from './../pages/user/AuthPage';
import LogoutPage from './../pages/user/LogoutPage';
import EditPage from './../pages/user/EditPage';
// import DrawalPage from './../pages/DrawalPage';

export default function AppRoutes({ user, setUser, handleLogout }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mypage" element={<MyPage user={user} setUser={setUser} />} />

      <Route path="/product/list" element={<ProductList user={user} />} />
      <Route path="/product/:id" element={<Product user={user} />} />
      <Route path="/cart" element={<CartList user={user} />} />
      <Route path="/receipt" element={<Receipt user={user} />} />

      <Route path="/admin/rental" element={<AdminRentalListPage user={user} />} />
      <Route path="/admin/saleshistory" element={<SalesHistory user={user} />} />
      <Route path="/admin/product/register" element={<ProductInsertForm user={user} />} />
      <Route path="/admin/product/update/:id" element={<ProductUpdateForm user={user} />} />

      <Route path="/product/:id/inquiry/list" element={<InquiryList user={user} />} />
      <Route path="/product/:id/inquiry/write" element={<InquiryWrite user={user} />} />
      <Route path="/review/list" element={<ReviewList />} />
      <Route path="/review/write" element={<ReviewWrite />} />

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