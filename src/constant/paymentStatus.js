import { FaMoneyCheckAlt, FaExclamationTriangle, FaCreditCard, FaUndoAlt, FaHourglassEnd } from "react-icons/fa";

export const PaymentStatus = [
  "PAID",
  "LATE",
  "UNPAID",
  "REFUNDED",
  "END",
];

export function PaymentStatusLabel(status) {
  const map = {
    PAID: <><FaMoneyCheckAlt style={{ color: '#28a745', marginRight: '4px' }} /> 결제 완료</>,
    LATE: <><FaExclamationTriangle style={{ color: "#dc3545", marginRight: "4px" }} /> 연체</>,
    UNPAID: <><FaCreditCard style={{ color: '#ffc107', marginRight: '4px' }} /> 미결제</>,
    REFUNDED: <><FaUndoAlt style={{ color: "#17a2b8", marginRight: "4px" }} /> 환불 완료</>,
    END: <><FaHourglassEnd style={{ color: "#6c757d", marginRight: "4px" }} /> 만료</>,
  };
  return map[status] || status;
}