import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
import InquiryWrite from './../pages/InquiryWrite';
import InquiryList from './../pages/InquiryList';
import ReviewPage from '../pages/ReviewPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/inquiry/write" element={<InquiryWrite />} />
      <Route path="/inquiry/list" element={<InquiryList />} />
      <Route path="/review" element={<ReviewPage />} />

    </Routes>
  );
}