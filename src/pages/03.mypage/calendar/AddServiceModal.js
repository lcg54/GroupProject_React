import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../../config/url";

export default function AddServiceModal({ day, selectedRental, onClose }) {
    const handleConfirm = async () => {
        try {
            // 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (시간대 문제 방지)
            const year = day.getFullYear();
            const month = String(day.getMonth() + 1).padStart(2, '0');
            const date = String(day.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${date}`;

            console.log("📅 등록할 날짜:", formattedDate);

            await axios.post(`${API_BASE_URL}/rental/service/add`, {
                rentalId: selectedRental.rentalId,
                rentalItemId: selectedRental.rentalItemId,
                serviceDate: formattedDate
            });

            alert("서비스 날짜가 등록되었습니다.");
            onClose(true); // 성공
        } catch (err) {
            console.error("서비스 날짜 등록 실패:", err);
            alert(err.response?.data || "등록에 실패했습니다.");
            onClose(false); // 실패
        }
    };

    const handleCancel = () => {
        onClose(false); // 취소
    };

    return (
        <Modal show={true} onHide={handleCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>서비스 날짜 선택</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    <strong>{day.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                    })}</strong>
                </p>
                <p>해당 일자로 서비스를 신청하시겠습니까?</p>
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