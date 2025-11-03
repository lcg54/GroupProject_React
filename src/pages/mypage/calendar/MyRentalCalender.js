import React, { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import styled from "styled-components";
import "./MyRentalCalender.css";
import { API_BASE_URL } from "../../../config/url";
import { Button, Form } from "react-bootstrap";
import Registration from "./Registration";

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
  const [currentMonth, setCurrentMonth] = useState(new Date()); // ✅ 달력의 현재 표시 월
  const [modalOpen, setModalOpen] = useState(false); // 모달 열림 여부
  const [pendingDay, setPendingDay] = useState(null); // 클릭한 날짜 임시 저장
  const [modalType, setModalType] = useState("");     // "add" | "remove"

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

  // ✅ 1년 전/후 버튼 클릭 시 달력 이동
  const handleMoveYear = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setFullYear(newMonth.getFullYear() - 1);
    } else if (direction === "next") {
      newMonth.setFullYear(newMonth.getFullYear() + 1);
    }
    setCurrentMonth(newMonth);
  };

  // ✅ 빠른 이동 (오늘 / 대여 시작일 / 대여 끝나는 날)
  const handleQuickMove = (type) => {
    let targetDate = null;

    if (type === "today") {
      targetDate = new Date();
    } else {
      if (!selectedRental) {
        alert("선택된 상품이 없습니다.");
        return;
      }

      if (type === "start") {
        targetDate = new Date(selectedRental.rentalStart);
      } else if (type === "end") {
        targetDate = new Date(selectedRental.rentalEnd);
      }
    }

    // ✅ 선택한 날짜 기준으로 달력 이동
    if (targetDate) {
      setCurrentMonth(targetDate);
    }
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
            {filteredRentals.map((r) => (
              <option key={r.productId} value={r.productId}>
                {r.productName}
              </option>
            ))}
          </Form.Select>

          {/* ✅ 빠른 이동 셀렉트 */}
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

        {/* ✅ 1년 전/후 버튼 */}
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button
            variant="outline-secondary"
            onClick={() => handleMoveYear("prev")}
          >
            ⏪ 1년
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => handleMoveYear("next")}
          >
            1년 ⏩
          </Button>
        </div>
      </Form>

      {/* 달력 */}
      <StyledDayPicker
        mode="multiple"
        selected={selected} // ✅ 클릭한 날짜 표시용
        onDayClick={(day, { selected: isAlreadySelected }) => {
          // day가 Date 객체인지 확인
          const clickDay = day instanceof Date ? day : new Date(day);

          setPendingDay(clickDay);
          setModalType(isAlreadySelected ? "remove" : "add");
          setModalOpen(true);
        }}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        disabled={(date) => {
          if (!selectedRental) return true;

          const day = date.getDay();
          const isWeekend = day === 0 || day === 6; // 주말
          const isToday = date.toDateString() === today.toDateString();
          const isBeforeToday = date < today;
          const isWithinOneWeek = date > today && date <= oneWeekLater;

          const rentalStart = new Date(selectedRental.rentalStart);
          const rentalEnd = new Date(selectedRental.rentalEnd);
          const isBeforeStart = date < rentalStart;
          const isAfterEnd = date > rentalEnd;

          // 🔹 클릭한 연도 관련 로직
          const isSameYearAsClicked =
            pendingDay && date.getFullYear() === pendingDay.getFullYear();
          const isSameDayAsClicked =
            pendingDay && date.toDateString() === pendingDay.toDateString();

            

          // ✅ 1. 클릭한 연도면, 클릭한 당일 외에는 전부 비활성화
          const isOtherDayInClickedYear =
            isSameYearAsClicked && !isSameDayAsClicked;

          // 🔹 대여 시작일 기준 6개월 미만이면 해당 연도 전체 클릭 불가
          const sixMonthsAfterStart = new Date(rentalStart);
          sixMonthsAfterStart.setMonth(sixMonthsAfterStart.getMonth() + 6);

          const isStartWithinSixMonthsOfYearEnd =
            rentalStart.getFullYear() === date.getFullYear() &&
            sixMonthsAfterStart.getFullYear() > rentalStart.getFullYear();

          return (
            isWeekend ||
            isToday ||
            isBeforeToday ||
            isWithinOneWeek ||
            isBeforeStart ||
            isAfterEnd ||
            isOtherDayInClickedYear || // 👈 클릭한 연도의 다른 날짜 비활성화
            isStartWithinSixMonthsOfYearEnd // 👈 6개월 미만이면 해당 연도 전부 비활성화
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
      {modalOpen && pendingDay && (
        <Registration
          day={pendingDay}
          type={modalType}  // "add" | "remove"
          onClose={(ok) => {
            if (ok) {
              if (modalType === "remove") {
                setSelected(selected.filter(
                  (d) => new Date(d).toDateString() !== pendingDay.toDateString()
                ));
              } else if (modalType === "add") {
                setSelected([...selected, pendingDay]);
              }
            }

            setModalOpen(false);
            setPendingDay(null);
            setModalType("");
          }}
        />
      )}
    </div>
  );
}