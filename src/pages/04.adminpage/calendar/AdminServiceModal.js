import { useState, useRef } from "react";
import { Modal, Button, Table, Popover, Overlay } from "react-bootstrap";

export default function AdminServiceModal({ date, items, onClose }) {
  const formattedDate = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const [showPopover, setShowPopover] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState(null);
  const [popoverAddress, setPopoverAddress] = useState("");

  const containerRef = useRef(null);

  const handleRowClick = (event, item) => {
    setPopoverAddress(item.memberAddress || "주소 정보 없음");
    setPopoverTarget(event.currentTarget); // 클릭한 <tr> 또는 <td>가 anchor
    setShowPopover(true);
  };

  return (
    <Modal show={true} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{formattedDate} 예약 서비스 목록</Modal.Title>
      </Modal.Header>
      <Modal.Body ref={containerRef} style={{ position: "relative" }}>
        {items.length === 0 ? (
          <p>해당 날짜에 예약된 서비스가 없습니다.</p>
        ) : (
          <Table striped bordered hover size="sm" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "45%", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }} />
              <col style={{ width: "10%", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }} />
              <col style={{ width: "28%", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }} />
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
                <tr
                  key={item.rentalItemId}
                  onClick={(e) => handleRowClick(e, item)}
                  style={{ cursor: "pointer" }}
                >
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

        <Overlay
          show={showPopover}
          target={popoverTarget}
          placement="top"
          container={containerRef}
          rootClose={true}
          onHide={() => setShowPopover(false)}
        >
          <Popover id="popover-address">
            <Popover.Header as="h3">회원 주소</Popover.Header>
            <Popover.Body>
              {popoverAddress}
            </Popover.Body>
          </Popover>
        </Overlay>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onClose}>닫기</Button>
      </Modal.Footer>
    </Modal>
  );
}