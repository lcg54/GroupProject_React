import React from "react";
import { Button } from "react-bootstrap";
import { API_BASE_URL } from "../../../config/url";

export default function Modal({ day, type, onClose, selectedRental }) {
    const message =
        type === "remove"
            ? `${day.toDateString()} 선택을 취소하시겠습니까?`
            : `${day.toDateString()}를 선택하시겠습니까?`;

    const handleConfirm = async () => {
        try {
            if (type === "add") {
                await fetch(`${API_BASE_URL}/service/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        rentalItemId: selectedRental.id, // 렌탈 아이템 ID
                        serviceDate: day.toISOString().split("T")[0], // 서비스 날짜
                    }),
                });
            } else {
                await fetch(`${API_BASE_URL}/service/remove`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        rentalItemId: selectedRental.id, // 렌탈 아이템 ID
                        serviceDate: day.toISOString().split("T")[0], // 서비스 날짜
                    }),
                });
            }
            onClose(true);
        } catch (err) {
            console.error(err);
            alert("처리 중 오류가 발생했습니다.");
            onClose(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
                <p>{message}</p>
                <Button onClick={handleConfirm}>확인</Button>
                <Button onClick={() => onClose(false)}>취소</Button>
            </div>
        </div>
    );
}
