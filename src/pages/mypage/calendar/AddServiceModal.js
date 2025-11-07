import React from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../../config/url";

export default function AddServiceModal({ day, onClose, selectedRental }) {
    const message = `${day.toDateString()}를 선택하시겠습니까?`;

    const handleConfirm = async () => {
        try {
            if (!selectedRental || !selectedRental.rentalId) {
                alert("렌탈 아이템을 선택해주세요.");
                return;
            }
            if (!day) {
                alert("날짜를 선택해주세요.");
                return;
            }

            const payload = {
                rentalItemId: selectedRental.rentalId,
                serviceDate: day.toISOString().split("T")[0],
            };

            console.log("📡 요청 보냄:", payload);

            const res = await axios.post(`${API_BASE_URL}/rental/service/add`, payload);

            console.log("✅ 서버 응답:", res.data);
            alert("예약이 성공적으로 처리되었습니다!");
            onClose(true);
        } catch (err) {
            console.error(err);
            alert(err.response?.data || err.message);
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
            <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
                <p>{message}</p>
                <Button onClick={handleConfirm}>확인</Button>
                <Button onClick={() => onClose(false)}>취소</Button>
            </div>
        </div>
    );
}
