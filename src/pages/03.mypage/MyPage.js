import { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { API_BASE_URL } from '../../config/url';
import '../../css/MyPage.css';

export default function MyPage({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");

  const buttons = [
    { icon: "🧾", text: "주문 내역", path: "receipt" },
    { icon: "🛒", text: "장바구니", path: "cart" },
    { icon: "📅", text: "서비스 알림", path: "calendar" },
    { icon: "⭐", text: "리뷰 내역", path: "review/list" },
    { icon: "📢", text: "문의 내역", path: "inquiry/list" },
    { icon: "✏️", text: "내 정보 수정", path: "member/edit" },
  ];

  // URL에 따라 활성 탭 갱신
  useEffect(() => {
    const matchedButton = buttons.find(btn => location.pathname.includes(btn.path));
    setActiveTab(matchedButton?.path || "");
  }, [location.pathname]);

  if (!user) {
    return (
      <Container className="mt-4 text-center">
        <h4>로그인이 필요합니다.</h4>
        <Button
          variant="primary"
          className="mt-3"
          onClick={() => navigate('/member/login')}
        >
          로그인하기
        </Button>
      </Container>
    );
  }

  // 버튼 클릭 시 네비게이션 이동
  const handleClick = (path) => {
    navigate(`/mypage/${path}`);
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "750px" }}>
      {/* 상단 인사말 */}
      <div
        className="mb-4 d-flex justify-content-between align-items-center"
        style={{
          maxWidth: '900px',
          backgroundColor: '#3CB371',
          padding: '1rem 2rem',
          borderRadius: '10px'
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <img
            src={`${API_BASE_URL}/images/${user.profileImage}`}
            alt="프로필"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <h3 className="m-0 text-white">{user.name}님</h3>
        </div>
      </div>

      {/* 버튼 영역 */}
      <Row>
        {buttons.map((button, idx) => (
          <Col key={idx} xs={4} className="mb-4">
            <Button
              className={`button mypage w-100 d-flex flex-column align-items-center py-4 rounded-3 ${activeTab === button.path ? "active" : ""}`}
              onClick={() => handleClick(button.path)}
            >
              <span style={{ fontSize: "2.5rem", marginBottom: "8px" }}>{button.icon}</span>
              {button.text}
            </Button>
          </Col>
        ))}
      </Row>

      {/* Outlet (모든 하위 페이지 출력) */}
      <div className="mt-3">
        <Outlet context={{ user, setUser }} />
      </div>
    </Container>
  );
}