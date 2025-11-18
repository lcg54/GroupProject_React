import { useEffect, useState } from "react";
import { Button, Card, Container } from "react-bootstrap";
import "react-day-picker/dist/style.css";
import axios from "axios";
import { API_BASE_URL } from "../../../config/url";
import { StyledDayPicker } from "./StyledDayPicker";
import { ko } from 'date-fns/locale';
import AdminServiceModal from "./AdminServiceModal";
import { useNavigate } from "react-router-dom";

export default function AdminServiceCalendar({ user }) {
  const [allServiceDates, setAllServiceDates] = useState({}); 
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [itemsForSelectedDate, setItemsForSelectedDate] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const userRole = user?.role || storedUser?.role;
    if (userRole !== "ADMIN") {
      alert("관리자만 접근 가능한 페이지입니다.");
      navigate(`/member/login`);
    }
    fetchAllServiceDates();
  }, [user]);

  const fetchAllServiceDates = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/rental/service/admin/all`);
      const data = res.data;

      const formatted = {};
      data.forEach(item => {
        const dateKey = item.serviceDate;
        if (!formatted[dateKey]) formatted[dateKey] = [];
        formatted[dateKey].push(item);
      });
      setAllServiceDates(formatted);
    } catch (err) {
      console.error("전체 서비스일 조회 실패:", err);
    }
  };

  const handleDayClick = async (date) => {
    const dateKey = date.getFullYear() + '-' 
      + String(date.getMonth()+1).padStart(2,'0') + '-' 
      + String(date.getDate()).padStart(2,'0');

    try {
      const res = await axios.get(`${API_BASE_URL}/rental/service/admin`, {
        params: { date: dateKey }
      });
      setItemsForSelectedDate(res.data);
      setSelectedDate(date);
      setModalOpen(true);
    } catch (err) {
      console.error("선택 날짜 서비스 조회 실패:", err);
      setItemsForSelectedDate([]);
    }
  };

  const disabled = (date) => {
    const dateKey = date.getFullYear() + '-' 
      + String(date.getMonth() + 1).padStart(2,'0') + '-' 
      + String(date.getDate()).padStart(2,'0');

    return !allServiceDates[dateKey];
  };

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      <Card className="shadow-lg border-0">
        <Card.Header className="text-center fw-bold bg-light mb-4" style={{ fontSize: 18 }}>서비스 일정 조회</Card.Header>
        <StyledDayPicker
          mode="default"
          locale={ko}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          onDayClick={handleDayClick}
          disabled={disabled}
          modifiers={{
            serviceDates: Object.keys(allServiceDates).map(d => {
              const [year, month, day] = d.split('-').map(Number);
              return new Date(year, month - 1, day);
            }),
          }}
          modifiersClassNames={{
            serviceDates: "service-date-day",
          }}
          formatters={{
            formatWeekdayName: (date) => ['일','월','화','수','목','금','토'][date.getDay()],
          }}
        />

        {modalOpen && selectedDate && (
          <AdminServiceModal
            date={selectedDate}
            items={itemsForSelectedDate}
            onClose={() => setModalOpen(false)}
          />
        )}
      </Card>
    </Container>
  );
}