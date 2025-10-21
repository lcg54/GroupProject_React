import { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

import ServiceDate from './ServiceDate';
import ExtensionOrReturn from './EOR/ExtensionOrReturn';
import CartList from '../CartList';
import Receipt from './Receipt';

const MyPage = ({ user }) => {
  const [clickedButton, setClickedButton] = useState(null);

  const buttons = [
    { icon: "🛒", text: "내 카트" },
    { icon: "🧾", text: "결제 내역" },
    { icon: "📅", text: "서비스 알림" },
    { icon: "📢", text: "내 문의사항" },
    { icon: "✏️", text: "내 정보 수정" },
    { icon: "➕➖", text: "연장/반납" },
  ];

  const handleClick = (button) => {
    setClickedButton(button); // 클릭된 버튼 정보 저장
  };

  if (!user) {
    return (
      <Container className="mt-4 text-center">
        <h4>로그인이 필요합니다.</h4>
      </Container>
    );
  }

  function renderContent(button) {
    switch (button.text) {
      case '내 카트':
        return <CartList />;
      // 이렇게 간의 페이지처럼 보여주던지 경로로 아에 넘기든 할 생각
      case '결제 내역':
        return <Receipt />;
      case '서비스 알림':
        return <ServiceDate />;
      case '내 문의사항':
        return <p>메뉴4 전용 내용</p>;
      case '내 정보 수정':
        return <p>메뉴5 전용 내용</p>;
      case '연장/반납':
        return <ExtensionOrReturn />;
      default:
        return <p>기본 내용</p>;
    }
  }


  return (
    <Container className="mt-4" style={{ maxWidth: "750px" }}>
      {/* 인사말 */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h3>안녕하세요 {user.name}님</h3>
        <span className="badge bg-warning text-dark" style={{ fontSize: "1rem" }}>
          {user.grade} 등급
        </span>
      </div>

      {/* 2행 3열 버튼 영역 */}
      <Row>
        {buttons.map((button, idx) => (
          <Col key={idx} xs={4} className="mb-4">
            <Button
              variant="outline-primary"
              className="w-100 d-flex flex-column align-items-center py-4 rounded-3"
              style={{ minHeight: "120px", fontSize: "1.1rem" }}
              onClick={() => handleClick(button)} // 클릭 이벤트
            >
              <span style={{ fontSize: "2.5rem", marginBottom: "8px" }}>{button.icon}</span>
              {button.text}
            </Button>
          </Col>
        ))}
      </Row>

      {/* 버튼중 내 카트, 서비스 알림(달력으로 표시), 내 문의사항, 연장 반납 선택시 보여주는 화면 추가 */}
      {clickedButton?.text && (
        <div className="mt-4 p-3 border rounded bg-light">
          <h5>🔍 선택한 메뉴: {clickedButton.text}</h5>
          {renderContent(clickedButton)}
        </div>
      )}

      {/* 1개~3개정도 주문내역 생각중 */}



    </Container>
  );
};

export default MyPage;