import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
import ProductList from '../pages/product/ProductList';
import Product from '../pages/product/Product';
import InquiryList from './../pages/InquiryList';
import InquiryWrite from './../pages/InquiryWrite';
import ReviewPage from '../pages/ReviewPage';
import AppWrapper from "./AppWrapper";
import MyPage from "../pages/mypage/MyPage";
import CartList from "../pages/CartList";
import AdminProductForm from "../pages/AdminProductForm";
import Login from "../pages/Login";


export default function AppRoutes({ user, setUser }) {
  return (
    <AppWrapper>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/list" element={<ProductList user={user} />} />
        <Route path="/product/:id" element={<Product user={user} />} />
        <Route path="/inquiry/list" element={<InquiryList />} />
        <Route path="/inquiry/write" element={<InquiryWrite />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/mypage" element={<MyPage user={user} />} />
        <Route path="/cart" element={<CartList user={user} />} />
        <Route path="/admin/product/register" element={<AdminProductForm />} />
        <Route path="/login" element={<Login user={user} setUser={setUser} />} />

      </Routes>
    </AppWrapper>

  );
}