import React from "react";

export default function Modal({ day, type, onClose }) {
    const message =
        type === "remove"
            ? `${day.toDateString()} 선택을 취소하시겠습니까?`
            : `${day.toDateString()}를 선택하시겠습니까?`;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", display: "flex",
            justifyContent: "center", alignItems: "center"
        }}>
            <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
                <p>{message}</p>
                <button onClick={() => onClose(true)}>확인</button>
                <button onClick={() => onClose(false)}>취소</button>
            </div>
        </div>
    );
}