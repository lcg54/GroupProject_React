import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
// import MyPage from "../mypage";
// import CartList from "../pages/CartList";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/" element={<MyPage/>}></Route> */}
    </Routes>
  );
}