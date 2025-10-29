import React, { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import styled from "styled-components";
import "./MyRentalCalender.css";
import { API_BASE_URL } from "../../../config/url";

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
  const [selected, setSelected] = useState([]);
  const [rentals, setRentals] = useState([]);           // 전체 상품 목록
  const [filteredRentals, setFilteredRentals] = useState([]); // 필터된 상품 목록
  const [selectedRental, setSelectedRental] = useState(null); // 선택된 상품


  const today = new Date();

  useEffect(() => {
    if (user?.id) {
      fetchRentals();
    }
  }, [user]);

  const fetchRentals = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rental/date/${user.id}`);
      if (!res.ok) throw new Error("대여 내역을 불러오는 중 오류 발생");

      const data = await res.json();
      const simplified = data.map(r => ({
        id: r.id,
        productId: r.productId,
        productName: r.productName,
        startDate: r.rentalStart,
        endDate: r.rentalEnd
      }));

      setRentals(simplified);
      setFilteredRentals(simplified);

    } catch (err) {
      console.error(err);
    }
  };

  // 상품 선택 시
  const handleRentalSelect = (rentalId) => {
    const rental = rentals.find(r => r.id === rentalId);
    setSelectedRental(rental);
    setSelected([]); // 기존 선택 초기화
  };

  return (
    <div>
      {/* 상품 필터 */}
      <select
        onChange={(e) => handleRentalSelect(Number(e.target.value))}
        value={selectedRental?.id || ""}
      >
        <option value="">상품을 선택하세요</option>
        {rentals.map(r => (
          <option key={r.id} value={r.id}>
            {r.productName}
          </option>
        ))}
      </select>

      {/* 달력 */}
      <StyledDayPicker
        mode="multiple"
        selected={selected}
        onSelect={setSelected}
        disabled={(date) => {
          // 상품이 선택되지 않으면 전체 선택 불가
          if (!selectedRental) return true;

          const day = date.getDay();
          const isWeekend = day === 0 || day === 6; // 주말
          const isToday = date.toDateString() === today.toDateString();

          // 오늘 기준 범위
          const oneWeekLater = new Date(today);
          oneWeekLater.setDate(today.getDate() + 7);

          // 조건 계산
          const isBeforeToday = date < today;
          const isAfterOneWeek = date > oneWeekLater;
          const isBeforeStart = date < new Date(selectedRental.startDate);
          const isAfterEnd = date > new Date(selectedRental.endDate);

          // 동일 연도 이미 선택했으면 선택 불가
          let alreadySelectedInYear = false;
          for (let i = 0; i < (selected || []).length; i++) {
            if (selected[i].getFullYear() === date.getFullYear()) {
              alreadySelectedInYear = true;
              break;
            }
          }

          return (
            isWeekend ||
            isToday ||
            isBeforeToday ||
            !isAfterOneWeek ||
            isBeforeStart ||
            isAfterEnd ||
            alreadySelectedInYear
          );
        }}
        modifiers={{
          // 상품 선택 전엔 highlight 없음
          highlight: selectedRental
            ? { from: new Date(selectedRental.startDate), to: new Date(selectedRental.endDate) }
            : undefined,
          selected: selected ? [selected] : [],
        }}
        modifiersClassNames={{
          highlight: "highlight-day",
          selected: "selected-day",
        }}
      />

    </div>
  );
}

