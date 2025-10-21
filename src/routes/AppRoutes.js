import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
import ProductList from './../pages/ProductList';
import Product from '../pages/Product';
import InquiryList from './../pages/InquiryList';
import InquiryWrite from './../pages/InquiryWrite';
import ReviewPage from '../pages/ReviewPage';
import MyPage from "../pages/mypage/mypage";
import CartList from "../pages/CartList";
import AppWrapper from "./AppWrapper";
import Header from "../ui/Header";

export default function AppRoutes({ user }) {
  return (
    <AppWrapper>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/list" element={<ProductList user={user} />} />
        <Route path="/product/:id" element={<Product user={user} />} />
        <Route path="/inquiry/list" element={<InquiryList />} />
        <Route path="/inquiry/write" element={<InquiryWrite />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/member/mypage" element={<MyPage user={user} />} />
        <Route path="/member/cart" element={<CartList />} />

      </Routes>
    </AppWrapper>
  );
}