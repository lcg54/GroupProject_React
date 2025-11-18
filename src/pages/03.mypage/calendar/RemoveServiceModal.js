import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../../config/url";

export default function RemoveServiceModal({ day, selectedRental, onClose }) {
  const handleConfirm = async () => {
    try {
      if (!selectedRental || !selectedRental.rentalItemId) {
        alert("렌탈 아이템을 선택해주세요.");
        return;
      }
      if (!day) {
        alert("날짜를 선택해주세요.");
        return;
      }

      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, "0");
      const date = String(day.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${date}`;

      console.log("📡 삭제 요청 보냄:", {
        rentalItemId: selectedRental.rentalItemId,
        serviceDate: formattedDate,
      });

      const res = await axios.post(`${API_BASE_URL}/rental/service/remove`, {
        rentalItemId: selectedRental.rentalItemId,
        serviceDate: formattedDate,
      });

      console.log("✅ 서버 응답:", res.data);
      alert("서비스 날짜가 취소되었습니다.");
      onClose(true); // 성공
    } catch (err) {
      console.error("서비스 날짜 취소 실패:", err);
      alert(err.response?.data || "취소에 실패했습니다.");
      onClose(false); // 실패
    }
  };

  const handleCancel = () => {
    onClose(false); // 취소
  };

  return (
    <Modal show={true} onHide={handleCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>서비스 날짜 취소</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>
            {day.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </strong>
        </p>
        <p>선택을 취소하시겠습니까?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleConfirm}>
          확인
        </Button>
        <Button variant="danger" onClick={handleCancel}>
          취소
        </Button>
      </Modal.Footer>
    </Modal>
  );
}