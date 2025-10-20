import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
<<<<<<< HEAD
import InquiryWrite from './../pages/InquiryWrite';
import InquiryList from './../pages/InquiryList';
import ReviewPage from '../pages/ReviewPage';
=======
import ProductList from './../pages/ProductList';
import Product from '../pages/Product';
import InquiryList from './../pages/InquiryList';
import InquiryWrite from './../pages/InquiryWrite';
import ReviewPage from '../pages/ReviewPage';
import MyPage from "../pages/MyPage";
import CartList from "../pages/CartList";
>>>>>>> 46dd89c547044ba658b053c645d34dcdc9f7fe3c

export default function AppRoutes({ user }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
<<<<<<< HEAD
      <Route path="/inquiry/write" element={<InquiryWrite />} />
      <Route path="/inquiry/list" element={<InquiryList />} />
      <Route path="/review" element={<ReviewPage />} />
=======
      <Route path="/product/list" element={<ProductList user={user} />} />
      <Route path="/product/:id" element={<Product user={user} />} />
      <Route path="/inquiry/list" element={<InquiryList />} />
      <Route path="/inquiry/write" element={<InquiryWrite />} />
      <Route path="/review" element={<ReviewPage />} />
      <Route path="/member/mypage" element={<MyPage/>} />
      <Route path="/member/cart" element={<CartList/>} />
>>>>>>> 46dd89c547044ba658b053c645d34dcdc9f7fe3c

    </Routes>
  );
}