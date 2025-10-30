import React, { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import styled from "styled-components";
import "./MyRentalCalender.css";
import { API_BASE_URL } from "../../../config/url";
import { Form } from "react-bootstrap";

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
  const [selected, setSelected] = useState([]); // 클릭한 날짜들
  const [rentals, setRentals] = useState([]); // 전체 상품 목록
  const [filteredRentals, setFilteredRentals] = useState([]); // 필터된 상품 목록
  const [selectedRental, setSelectedRental] = useState(null); // 선택된 상품
  

  const today = new Date();

  useEffect(() => {
    if (!user?.id) return;
    fetchRentals();
  }, [user]);

  // ✅ 전체 상품 목록 불러오기
  const fetchRentals = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rental/member/${user.id}`);
      if (!res.ok) throw new Error("대여 내역을 불러오는 중 오류 발생");

      const data = await res.json();

      // 각 rental.items를 납작하게 펴서 상품 단위로 정리
      const simplified = data.flatMap(rental =>
        rental.items?.map(item => ({
          rentalId: rental.id, // 대여 내역 ID
          productId: item.productId, // 상품 ID
          productName: item.productName,
          rentalStart: item.rentalStart,
          rentalEnd: item.rentalEnd,
        })) || []
      );

      setRentals(simplified);
      setFilteredRentals(simplified);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ 상품 선택 시
  const handleRentalSelect = (productId) => {
    const foundItem = rentals.find(item => item.productId === productId);
    if (!foundItem) return;

    setSelectedRental(foundItem);
    setSelected([]); // 상품 바꿀 때 클릭된 날짜 초기화
  };

  // ✅ 대여 시작~끝 날짜 사이의 모든 날짜 배열 반환
  const getDateRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // ✅ 오늘 이후 1주일 제한
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);

  return (
    <div>
      {/* 상품 필터 */}
      <Form>
        <Form.Select
          onChange={(e) => handleRentalSelect(Number(e.target.value))}
          value={selectedRental?.productId || ""}
        >
          <option value="">상품을 선택하세요</option>
          {filteredRentals.map((r) => (
            <option key={r.productId} value={r.productId}>
              {r.productName}
            </option>
          ))}
        </Form.Select>
      </Form>

      {/* 달력 */}
      <StyledDayPicker
        mode="multiple"
        selected={selected} // ✅ 클릭한 날짜 표시용
        onSelect={setSelected} // 클릭한 날짜 변경
        disabled={(date) => {
          if (!selectedRental) return true;

          const day = date.getDay();
          const isWeekend = day === 0 || day === 6; // 주말
          const isToday = date.toDateString() === today.toDateString();
          const isBeforeToday = date < today;
          const isWithinOneWeek =
            date > today && date <= oneWeekLater;

          // ✅ 선택된 상품의 기간 밖은 클릭 불가
          const rentalStart = new Date(selectedRental.rentalStart);
          const rentalEnd = new Date(selectedRental.rentalEnd);
          const isBeforeStart = date < rentalStart;
          const isAfterEnd = date > rentalEnd;

          return (
            isWeekend ||
            isToday ||
            isBeforeToday ||
            isWithinOneWeek ||
            isBeforeStart ||
            isAfterEnd
          );
        }}

        modifiers={{
          // ✅ 선택된 상품의 대여 기간 형광 하이라이트
          highlight: selectedRental
            ? getDateRange(
              new Date(selectedRental.rentalStart),
              new Date(selectedRental.rentalEnd)
            )
            : [],
          today: [today],
        }}
        modifiersClassNames={{
          highlight: "highlight-day", // 대여기간 전체 형광
          selected: "selected-day", // 사용자가 클릭한 날짜 강조
          today: "today-day", // 오늘 날짜 표시
        }}
      />
    </div>
  );
}
