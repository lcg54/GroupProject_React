import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
import ProductList from '../pages/product/ProductList';
import Product from '../pages/product/Product';
import InquiryList from './../pages/InquiryList';
import InquiryWrite from './../pages/InquiryWrite';
import ReviewPage from '../pages/ReviewPage';
import MyPage from "../pages/mypage/MyPage";
import CartList from "../pages/CartList";

export default function AppRoutes({ user }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product/list" element={<ProductList user={user} />} />
      <Route path="/product/:id" element={<Product user={user} />} />
      <Route path="/inquiry/list" element={<InquiryList />} />
      <Route path="/inquiry/write" element={<InquiryWrite />} />
      <Route path="/review" element={<ReviewPage />} />
      <Route path="/mypage" element={<MyPage user={user} />} />
      <Route path="/cart" element={<CartList user={user} />} />

    </Routes>
  );
}