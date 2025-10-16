import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
import MyPage from "../mypage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* <Route path="/" element={<HomePage />} /> */}
      <Route path="/" element={<MyPage></MyPage>}></Route>
    </Routes>
  );
}