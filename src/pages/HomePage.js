import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Container className="mt-4" style={{ maxWidth: "750px" }}>
      {/* 테스트용 네비게이션 버튼, 나중에 지울게요 */}
      <button onClick={() => navigate(`/product/list`)}>상품목록</button><br />
      <button onClick={() => navigate(`/inquiry/list`)}>문의게시판</button><br />
      <button onClick={() => navigate(`/review`)}>후기게시판</button><br />
      <button onClick={() => navigate(`/member/mypage`)}>마이페이지</button><br />
      <button onClick={() => navigate(`/member/cart`)}>장바구니</button><br />
      <button onClick={() => navigate(`/admin/product/register`)}>관리자 상품 등록</button><br />
    </Container>
  );
}