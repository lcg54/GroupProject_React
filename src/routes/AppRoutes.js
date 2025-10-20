import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
import ProductList from './../pages/ProductList';
import Product from '../pages/Product';
import InquiryList from './../pages/InquiryList';
import InquiryWrite from './../pages/InquiryWrite';
import ReviewPage from '../pages/ReviewPage';
import MyPage from "../pages/MyPage";
import CartList from "../pages/CartList";
import AdminProductForm from "../pages/AdminProductForm";

export default function AppRoutes({ user }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product/list" element={<ProductList user={user} />} />
      <Route path="/product/:id" element={<Product user={user} />} />
      <Route path="/inquiry/list" element={<InquiryList />} />
      <Route path="/inquiry/write" element={<InquiryWrite />} />
      <Route path="/review" element={<ReviewPage />} />
      <Route path="/member/mypage" element={<MyPage/>} />
      <Route path="/member/cart" element={<CartList/>} />

      {/* 관리자 페이지 */}
      <Route path="/admin/product/register" element={<AdminProductForm />} />
      <Route path="/admin/product/edit/:id" element={<AdminProductForm />} />

    </Routes>
  );
}