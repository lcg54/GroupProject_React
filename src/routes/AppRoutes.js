import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
import InquiryWrite from './../pages/InquiryWrite';
import InquiryList from './../pages/InquiryList';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/inquiry/write" element={<InquiryWrite user={user} />} />
      <Route path="/inquiry/list" element={<InquiryList user={user} />} />

    </Routes>
  );
}