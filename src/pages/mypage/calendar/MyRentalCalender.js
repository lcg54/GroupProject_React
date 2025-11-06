import React, { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import styled from "styled-components";
import "./MyRentalCalender.css";
import { API_BASE_URL } from "../../../config/url";
import { Button, Form } from "react-bootstrap";
import Registration from "./Registration";
import axios from "axios";

const CalendarWrapper = styled.div`
  width: 100%;
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fdf6e3;
  padding: 1rem;
`;

const StyledDayPicker = styled(DayPicker)`
  width: 100%;
  max-width: 1000px;

  .rdp-day {
    width: 100px;
    height: 80px;
    font-size: 1.1rem;
    border-radius: 10px;
    transition: all 0.2s;
  }

  .rdp-day:hover {
    transform: scale(1.05);
  }

  /* 클릭된 날짜 */
  .selected-day {
    background-color: #3cb371 !important;
    color: white !important;
    font-weight: bold;
    border-radius: 8px;
    box-shadow: 0 0 8px rgba(60, 179, 113, 0.4);
  }

  /* 선택 가능한 날짜 구간 */
  .highlight-day {
    background-color: rgba(186, 104, 200, 0.15);
    border-radius: 8px;
  }

  .rdp-months {
    justify-content: center;
  }

  .rdp-caption {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ff6f61;
  }
`;

export default function MyCalendar({ user }) {
  const [rentals, setRentals] = useState([]); // 전체 상품 목록
  const [selectedRental, setSelectedRental] = useState(null); // 선택된 상품
  const [currentMonth, setCurrentMonth] = useState(new Date()); // 달력의 현재 표시 월
  const [modalOpen, setModalOpen] = useState(false); // 모달 열림 여부
  const [pendingDay, setPendingDay] = useState(null); // 클릭한 날짜 임시 저장
  const [modalType, setModalType] = useState(""); // "add" | "remove"
  const [selectedByRental, setSelectedByRental] = useState({}); // { [rentalId]: [dates] }

  const today = new Date();

  // 전체 상품 목록 불러오기
  useEffect(() => {
    if (!user?.id) return;
    fetchRentals();
  }, [user]);

  const fetchRentals = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/rental/member/${user.id}`);
      const data = res.data;

      const simplified = data.flatMap(rental =>
        rental.items?.map(item => ({
          rentalId: rental.id,
          rentaItemlId: item.itemId,
          productId: item.productId,
          productName: item.productName,
          rentalStart: item.rentalStart,
          rentalEnd: item.rentalEnd,
        })) || []
      );

      setRentals(simplified);
    } catch (err) {
      console.error("대여 내역 불러오기 실패:", err);
    }
  };

  const fetchServiceDates = async (rentalItemId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/rental/service/${rentalItemId}/service-dates`);
      console.log(res.data);
      const data = res.data;

      const list = Array.isArray(data)
        ? data
        : data?.serviceDate
          ? [data]
          : [];

      // 각 날짜를 { id, rentalItemId, serviceDate } 형태로 변환
      const formatted = list.map(item => ({
        id: item.id, // ServiceDate_id
        rentalItemId: item.rentalItem?.id, // RentalItem id
        serviceDate: new Date(item.serviceDate)
      }));

      setSelectedByRental(prev => ({
        ...prev,
        [rentalItemId]: formatted
      }));
    } catch (err) {
      console.error("서비스 날짜 불러오기 실패:", err);
    }
  };


  const handleRentalSelect = (productId) => {
    const foundItem = rentals.find(item => item.productId === productId);
    if (!foundItem) return;

    setSelectedRental(foundItem);
    fetchServiceDates(foundItem.id);
  };

  const getDateRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);

  const handleMoveYear = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(direction === "prev" ? newMonth.getFullYear() - 1 : newMonth.getFullYear() + 1);
    setCurrentMonth(newMonth);
  };

  const handleQuickMove = (type) => {
    let targetDate = null;

    if (type === "today") {
      targetDate = new Date();
    } else if (selectedRental) {
      targetDate = type === "start" ? new Date(selectedRental.rentalStart) : new Date(selectedRental.rentalEnd);
    } else {
      alert("선택된 상품이 없습니다.");
      return;
    }

    setCurrentMonth(targetDate);
  };

  const disabled = (date) => {
    if (!selectedRental) return true;

    const day = date.getDay();
    const rentalStart = new Date(selectedRental.rentalStart);
    const rentalEnd = new Date(selectedRental.rentalEnd);

    const isBeforeToday = date < today;
    const isWeekend = day === 0 || day === 6;
    const isBeforeStart = date < rentalStart;
    const isAfterEnd = date > rentalEnd;
    const isWithinOneWeek = date > today && date <= oneWeekLater;

    return isWeekend || isBeforeToday || isBeforeStart || isAfterEnd || isWithinOneWeek;
  };

  return (
    <div>
      {/* 상품 선택 + 버튼 한 줄로 */}
      <Form className="d-flex align-items-center gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <Form.Select
            onChange={(e) => handleRentalSelect(Number(e.target.value))}
            value={selectedRental?.productId || ""}
            style={{ width: "200px" }}
          >
            <option value="">상품을 선택하세요</option>
            {rentals.map((r) => (
              <option key={r.productId} value={r.productId}>
                {r.productName}
              </option>
            ))}
          </Form.Select>

          <Form.Select
            defaultValue=""
            onChange={(e) => handleQuickMove(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="">빠른 이동</option>
            <option value="today">오늘로 가기</option>
            <option value="start">대여 시작일로 가기</option>
            <option value="end">대여 끝나는 날로 가기</option>
          </Form.Select>
        </div>

        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" onClick={() => handleMoveYear("prev")}>
            ⏪ 1년
          </Button>
          <Button variant="outline-secondary" onClick={() => handleMoveYear("next")}>
            1년 ⏩
          </Button>
        </div>
      </Form>

      {/* 달력 */}
      <StyledDayPicker
        mode="multiple"
        selected={selectedByRental[selectedRental?.id] || []}
        onDayClick={(day, { selected: isAlreadySelected }) => {
          setPendingDay(day);
          setModalType(isAlreadySelected ? "remove" : "add");
          setModalOpen(true);
        }}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        disabled={disabled}
        modifiers={{
          highlight: selectedRental ? getDateRange(new Date(selectedRental.rentalStart), new Date(selectedRental.rentalEnd)) : [],
          today: [today],
        }}
        modifiersClassNames={{
          highlight: "highlight-day",
          selected: "selected-day",
          today: "today-day",
        }}
      />

      {modalOpen && pendingDay && (
        <Registration
          day={pendingDay}
          type={modalType}
          selectedRental={selectedRental}
          onClose={(success) => {
            setModalOpen(false);
            setPendingDay(null);
            setModalType("");
            if (success) fetchServiceDates(selectedRental.id);
          }}
        />
      )}
    </div>
  );
}