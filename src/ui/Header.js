import { Link } from "react-router-dom";

export default function Header() {

  return (
    <header>
      <nav>
      {/* 관리자일 때만 상품 등록 버튼 노출
      {user && user.role === 'ADMIN' && (
        <Link to="/admin/product/register">상품 등록</Link> */}
      {/* 항상 상품 등록 버튼 보이기(임시) */}
      <Link to="/admin/product/register">상품 등록</Link>
      </nav>
    </header>
  );
}