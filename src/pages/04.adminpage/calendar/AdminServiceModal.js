import { Modal, Button, Table } from "react-bootstrap";

export default function AdminServiceModal({ date, items, onClose }) {
  const formattedDate = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const handleRowClick = (item) => {
    alert(`회원 주소: ${item.address || "정보 없음"}`);
  };

  return (
    <Modal show={true} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{formattedDate} 예약 서비스 목록</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {items.length === 0 ? (
          <p>해당 날짜에 예약된 서비스가 없습니다.</p>
        ) : (
          <Table striped bordered hover size="sm" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "45%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} />
              <col style={{ width: "10%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} />
              <col style={{ width: "28%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>상품명</th>
                <th>회원명</th>
                <th>대여 기간</th>
                <th>서비스 ID</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.rentalItemId}>
                  <td>{idx + 1}</td>
                  <td title={item.productName}>{item.productName}</td>
                  <td title={item.memberName}>{item.memberName}</td>
                  <td>{item.rentalStart} ~ {item.rentalEnd}</td>
                  <td>{item.rentalItemId}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onClose}>닫기</Button>
      </Modal.Footer>
    </Modal>
  );
}
