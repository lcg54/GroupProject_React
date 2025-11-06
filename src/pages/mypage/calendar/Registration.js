import React from "react";
import { Button } from "react-bootstrap";
import { API_BASE_URL } from "../../../config/url";

export default function Modal({ day, type, onClose, selectedRental }) {
    const message =
        type === "remove"
            ? `${day.toDateString()} 선택을 취소하시겠습니까?`
            : `${day.toDateString()}를 선택하시겠습니까?`;


    const payload = {
        rentalItemId: selectedRental.rentalId, // ID 맞춰서 전송
        serviceDate: day.toISOString().split("T")[0],
    };
    const handleConfirm = async () => {
        try {
            // selectedRental과 day가 존재하는지 확인
            if (!selectedRental || !selectedRental.rentalId) {
                alert("렌탈 아이템을 선택해주세요.");
                return;
            }
            if (!day) {
                alert("날짜를 선택해주세요.");
                return;
            }

            const rentalId = selectedRental.rentalId;
            const serviceDate = day.toISOString().split("T")[0]; // YYYY-MM-DD

            console.log("📡 요청 보냄:", type, { rentalId, serviceDate });

            const res = await fetch(`${API_BASE_URL}/rental/service/${type === "add" ? "add" : "remove"}`, {
                method: type === "add" ? "POST" : "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rentalItemId: rentalId,
                    serviceDate: serviceDate,
                }),
            });

            console.log("📥 응답 코드:", res.status);

            // JSON 읽기 전에 상태 확인
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`서버 오류: ${res.status} 응답 내용: ${errText}`);
            }

            const data = await res.json();
            console.log("✅ 서버 응답:", data);
            alert("예약이 성공적으로 처리되었습니다!");
        } catch (err) {
            console.error(err);
            alert(err.message);
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
