import { FaCheckCircle, FaTruck, FaHome, FaHourglassHalf, FaEnvelopeOpenText, FaTimesCircle, FaTools } from "react-icons/fa";

export const RentalStatus = [
  "RESERVED",
  "SHIPPING",
  "RENTED",
  "RETURN_REQUESTED",
  "RETURNED",
  "CANCELED",
  "REPAIR",
];

export function RentalStatusLabel(status) {
  const map = {
    RESERVED: <><FaCheckCircle style={{ color: '#28a745', marginRight: '4px' }} /> 예약 중</>,
    SHIPPING: <><FaTruck style={{ color: '#17a2b8', marginRight: '4px' }} /> 배송 중</>,
    RENTED: <><FaHome style={{ color: '#ffc107', marginRight: '4px' }} /> 대여 중</>,
    RETURN_REQUESTED: <><FaHourglassHalf style={{ color: '#fd7e14', marginRight: '4px' }} /> 반납 요청 중</>,
    RETURNED: <><FaEnvelopeOpenText style={{ color: '#007bff', marginRight: '4px' }} /> 반납 완료</>,
    CANCELED: <><FaTimesCircle style={{ color: '#dc3545', marginRight: '4px' }} /> 예약 취소</>,
    REPAIR: <><FaTools style={{ color: '#6c757d', marginRight: '4px' }} /> 수리 중</>,
  };
  return map[status] || status;
}
