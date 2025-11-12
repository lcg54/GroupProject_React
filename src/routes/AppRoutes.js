import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from '../pages/00.homepage/HomePage';

import AuthPage from '../pages/01.user/AuthPage';
import LogoutPage from '../pages/01.user/LogoutPage';
import EditPage from '../pages/01.user/EditPage';

import ProductList from '../pages/02.product/ProductList';
import Product from '../pages/02.product/Product';
import ReviewList from '../pages/02.product/ReviewList';
import ReviewWrite from '../pages/02.product/ReviewWrite';
import InquiryList from '../pages/02.product/InquiryList';
import InquiryWrite from '../pages/02.product/InquiryWrite';

import MyPage from "../pages/03.mypage/MyPage";
import MyInfoPage from "../pages/03.mypage/MyInfoPage";
import Receipt from "../pages/03.mypage/Receipt";
import MyCartList from "../pages/03.mypage/MyCartList";
import MyCalendar from "../pages/03.mypage/calendar/MyRentalCalender"
import MyReviewList from "../pages/03.mypage/MyReviewList";
import MyInquiryList from "../pages/03.mypage/MyInquiryList";
import MyWishListPage from "../pages/03.mypage/MyWishListPage";

import ProductInsertForm from "../pages/04.adminpage/ProductInsertForm";
import ProductUpdateForm from "../pages/04.adminpage/ProductUpdateForm";
import AdminCartList from "../pages/04.adminpage/AdminCartList";
import AdminRentalListPage from "../pages/04.adminpage/AdminRentalList";
import SalesHistory from '../pages/04.adminpage/SalesHistory';

import PaymentPage from "../pages/05.payment/PaymentPage";
import PaymentConfirm from "../pages/05.payment/PaymentConfirm";
import PaymentRegisterSuccess from "../pages/05.payment/PaymentRegisterSuccess";
import PaymentRegisterFail from "../pages/05.payment/PaymentRegisterFail";
import SubscriptionMadal from "../pages/05.payment/SubscriptionModal";

export default function AppRoutes({ user, setUser, handleLogout }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* /member - 회원정보 CRUD */}
      <Route path="/member/login" element={<AuthPage setUser={setUser} />} />
      <Route path="/member/signup" element={<AuthPage setUser={setUser} />} />
      <Route path="/member/logout" element={<LogoutPage onLogout={handleLogout} />} />
      <Route path="/member/edit" element={<EditPage user={user} setUser={setUser} />} />

      {/* /product - 상품페이지 */}
      <Route path="/product/list" element={<ProductList user={user} />} />
      <Route path="/product/:id" element={<Product user={user} />}>  
        <Route path="review/list" element={<ReviewList />} />
        <Route path="inquiry/list" element={<InquiryList />} />
      </Route>
      <Route path="/product/review/write" element={<ReviewWrite user={user} />} />
      <Route path="/product/:id/inquiry/write" element={<InquiryWrite user={user}/>} />

      {/* /mypage - 마이페이지 */}
      <Route path="/mypage" element={<MyPage user={user} setUser={setUser} />}>
        <Route path="info" element={<MyInfoPage />} />
        <Route index element={<Navigate to="receipt" replace />} />{/* 기본 탭 지정*/}
        <Route path="receipt" element={<Receipt />} />
        <Route path="cart" element={<MyCartList />} />
        <Route path="wishlist" element={<MyWishListPage />} />
        <Route path="calendar" element={<MyCalendar />} />
        <Route path="review/list" element={<MyReviewList />} />
        <Route path="inquiry/list" element={<MyInquiryList />} />
      </Route>

      {/* /admin - 관리자페이지 */}
      <Route path="/admin/product/register" element={<ProductInsertForm user={user} />} />
      <Route path="/admin/product/update/:id" element={<ProductUpdateForm user={user} />} />
      <Route path="/admin/cart" element={<AdminCartList user={user} />} />
      <Route path="/admin/rental" element={<AdminRentalListPage user={user} />} />
      <Route path="/admin/saleshistory" element={<SalesHistory user={user} />} />


      {/* /payment - 결제페이지 */}

      {/* 인스턴트 결제 (결제 실패 페이지는 따로 안 만들었음) */}
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/payment/confirm" element={<PaymentConfirm />} />

      {/* 정기 결제 수단 등록 (등록은 마이페이지-내정보에서) */}
      <Route path="/payment/success" element={<PaymentRegisterSuccess />} />
      <Route path="/payment/fail" element={<PaymentRegisterFail />} />

      {/* 정기 결제 */}
      <Route path="/payment/subscription" element={<SubscriptionMadal user={user} />} />

    </Routes>
  );
}