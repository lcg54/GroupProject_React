import React, { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import styled from "styled-components";
import "./MyRentalCalender.css";
import { API_BASE_URL } from "../../../config/url";
import { Button, Form } from "react-bootstrap";
import AddServiceModal from "./AddServiceModal";
import RemoveServiceModal from "./RemoveServiceModal";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ko } from "date-fns/locale";

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

  /* 서버에서 불러온 서비스 날짜 */
  .service-date-day {
    background-color: #3cb371 !important;
    color: white !important;
    font-weight: bold;
    border-radius: 8px;
    box-shadow: 0 0 8px rgba(60, 179, 113, 0.4);
  }
`;

export default function MyCalendar() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDay, setPendingDay] = useState(null);
  const [modalType, setModalType] = useState("");
  const [selectedByRental, setSelectedByRental] = useState({});
  const [quickMoveKey, setQuickMoveKey] = useState(0);
  const [serviceDateKey, setServiceDateKey] = useState(0);
  const [serviceSelectValue, setServiceSelectValue] = useState("");

  const today = new Date();

  useEffect(() => {
    if (!user?.id) return;
    fetchRentals();
  }, [user]);

  const fetchRentals = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/rental/member/${user.id}`);
      const data = res.data;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const simplified = data.flatMap(rental =>
        rental.items?.map(item => ({
          rentalId: rental.id,
          rentalItemId: item.itemId,
          productId: item.productId,
          productName: item.productName,
          rentalStart: item.rentalStart,
          rentalEnd: item.rentalEnd,
        })) || []
      ).filter(item => {
        const rentalEndDate = new Date(item.rentalEnd);
        rentalEndDate.setHours(0, 0, 0, 0);
        return rentalEndDate >= today;
      });

      setRentals(simplified);
    } catch (err) {
      console.error("대여 내역 불러오기 실패:", err);
    }
  };

  const handleRentalSelect = (productId) => {
    const foundItem = rentals.find(item => item.productId === productId);
    if (!foundItem) return;

    setSelectedRental(foundItem);
    setServiceSelectValue("");
    setCurrentMonth(new Date()); // 오늘 날짜로 리셋
    setQuickMoveKey(prev => prev + 1); // 빠른이동 드롭다운 리셋
    setServiceDateKey(prev => prev + 1); // 예약일 보기 드롭다운 리셋
    fetchServiceDates(foundItem.rentalItemId);
  };

  const fetchServiceDates = async (rentalItemId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/rental/service/${rentalItemId}/service-dates`);
      console.log("✅ serviceDates response:", res.data);

      const data = res.data;

      const list = Array.isArray(data)
        ? data
        : data?.serviceDate
          ? [data]
          : [];

      const formatted = list.map(item => {
        // 서버에서 받은 날짜 확인
        console.log("원본 날짜:", item.serviceDate);

        // 날짜 문자열을 로컬 날짜로 변환 (시간대 문제 방지)
        let localDate;
        if (typeof item.serviceDate === 'string') {
          // "YYYY-MM-DD" 형식인 경우
          if (item.serviceDate.includes('-')) {
            const [year, month, day] = item.serviceDate.split('-').map(Number);
            localDate = new Date(year, month - 1, day);
          } else {
            // 다른 형식인 경우
            localDate = new Date(item.serviceDate);
            localDate.setHours(0, 0, 0, 0);
          }
        } else {
          localDate = new Date(item.serviceDate);
          localDate.setHours(0, 0, 0, 0);
        }

        console.log("변환된 날짜:", localDate);

        return {
          id: item.id,
          rentalItemId: rentalItemId,
          serviceDate: localDate
        };
      });

      setSelectedByRental(prev => ({
        ...prev,
        [rentalItemId]: formatted
      }));
    } catch (err) {
      console.error("서비스 날짜 불러오기 실패:", err);
    }
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
    } else if (type === "available") {
      if (!selectedRental) {
        alert("선택된 상품이 없습니다.");
        return;
      }

      // 기존 예약일 중 가장 마지막 날짜 찾기
      const serviceDates = selectedByRental[selectedRental.rentalItemId] || [];
      console.log("📅 전체 예약일:", serviceDates);

      const lastServiceDate = serviceDates.length > 0
        ? new Date(Math.max(...serviceDates.map(sd => sd.serviceDate.getTime())))
        : null;

      console.log("📅 마지막 예약일:", lastServiceDate);

      // 예약 시작 가능일 계산
      const rentalStart = new Date(selectedRental.rentalStart);
      const sixMonthsAfterStart = new Date(rentalStart);
      sixMonthsAfterStart.setMonth(rentalStart.getMonth() + 6);

      const fourDaysFromToday = new Date();
      fourDaysFromToday.setDate(fourDaysFromToday.getDate() + 4);

      console.log("📅 대여시작일 + 6개월:", sixMonthsAfterStart);
      console.log("📅 오늘 + 4일:", fourDaysFromToday);

      // 기본 조건: 대여 시작일 + 6개월 OR 오늘 + 4일 중 더 늦은 날짜
      let baseDate = sixMonthsAfterStart > fourDaysFromToday ? sixMonthsAfterStart : fourDaysFromToday;
      console.log("📅 기본 날짜:", baseDate);

      // 이미 예약일이 있는 경우: 마지막 예약일 + 1년 후
      if (lastServiceDate) {
        const oneYearAfterLast = new Date(lastServiceDate);
        oneYearAfterLast.setFullYear(lastServiceDate.getFullYear() + 1);
        console.log("📅 마지막 예약일 + 1년:", oneYearAfterLast);
        targetDate = oneYearAfterLast > baseDate ? oneYearAfterLast : baseDate;
      } else {
        targetDate = baseDate;
      }

      console.log("📅 최종 선택된 날짜:", targetDate);
    } else if (selectedRental) {
      targetDate = type === "start" ? new Date(selectedRental.rentalStart) : new Date(selectedRental.rentalEnd);
    } else {
      alert("선택된 상품이 없습니다.");
      return;
    }

    setCurrentMonth(targetDate);
  };

  // 예약일로 이동
  const handleMoveToServiceDate = (serviceDate) => {
    setCurrentMonth(new Date(serviceDate));
  };

  const disabled = (date) => {
    if (!selectedRental) return true;

    const day = date.getDay();
    const rentalStart = new Date(selectedRental.rentalStart);
    const rentalEnd = new Date(selectedRental.rentalEnd);

    const today = new Date();
    const threeDaysFromToday = new Date(today);
    threeDaysFromToday.setDate(today.getDate() + 3);

    const serviceDates = selectedByRental[selectedRental.rentalItemId]?.map(d => new Date(d.serviceDate)) || [];

    const isServiceDate = serviceDates.some(d =>
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
    if (isServiceDate) return false;

    const isWeekend = day === 0 || day === 6;
    const isBeforeStart = date < rentalStart;
    const isAfterEnd = date > rentalEnd;
    const isWithinDisabledWindow = date <= threeDaysFromToday;

    const monthsSinceRentalStart = (date.getFullYear() - rentalStart.getFullYear()) * 12 + (date.getMonth() - rentalStart.getMonth());
    const isShortRentalPeriod = monthsSinceRentalStart < 6;

    const serviceYears = serviceDates.map(d => d.getFullYear());
    const isServiceYear = serviceYears.includes(date.getFullYear());

    return (
      isWeekend ||
      isBeforeStart ||
      isAfterEnd ||
      isWithinDisabledWindow ||
      isShortRentalPeriod ||
      isServiceYear
    );
  };

  // 클릭한 날짜가 이미 서비스 날짜인지 확인
  const isServiceDate = (date) => {
    if (!selectedRental) return false;
    const serviceDates = selectedByRental[selectedRental.rentalItemId] || [];
    return serviceDates.some(d =>
      d.serviceDate.getFullYear() === date.getFullYear() &&
      d.serviceDate.getMonth() === date.getMonth() &&
      d.serviceDate.getDate() === date.getDate()
    );
  };

  // 날짜 클릭 핸들러
  const handleDayClick = (day) => {
    if (!selectedRental) return;

    const isAlreadySelected = isServiceDate(day);
    setPendingDay(day);
    setModalType(isAlreadySelected ? "remove" : "add");
    setModalOpen(true);
  };

  // 서비스 날짜 목록 (렌더링용)
  const serviceDates = selectedRental
    ? (selectedByRental[selectedRental.rentalItemId] || [])
    : [];

  return (
    <div>
      <Form className="d-flex align-items-center gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <Form.Select
            onChange={(e) => handleRentalSelect(Number(e.target.value))}
            value={selectedRental?.productId || ""}
            style={{ width: "230px" }}
          >
            <option value="">상품을 선택하세요</option>
            {rentals.map((r) => (
              <option key={r.productId} value={r.productId}>
                {r.productName}
              </option>
            ))}
          </Form.Select>

          <Form.Select
            key={quickMoveKey}
            defaultValue=""
            onChange={(e) => handleQuickMove(e.target.value)}
            style={{ width: "140px" }}
          >
            <option value="today">빠른 이동</option>
            <option value="today">오늘로 가기</option>
            <option value="available">예약 시작 가능일로 가기</option>
            <option value="start">대여 시작일로 가기</option>
            <option value="end">대여 끝나는 날로 가기</option>
          </Form.Select>

          {/* 예약일 목록 드롭다운 */}
          {serviceDates.length > 0 && (
            <Form.Select
              value={serviceSelectValue}
              onChange={(e) => {
                const val = e.target.value;
                setServiceSelectValue(val);
                if (val) {
                  handleMoveToServiceDate(val);
                  // 선택 후에도 사용자가 선택값을 보고 싶다면 여기서 초기화하지 마세요.
                  // 상품 변경 시에는 handleRentalSelect에서 초기화됩니다.
                }
              }}
              style={{ width: "160px" }}
            >
              <option value="">예약일 보기</option>
              {serviceDates.map((sd, idx) => (
                <option key={idx} value={sd.serviceDate.toISOString()}>
                  {sd.serviceDate.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </option>
              ))}
            </Form.Select>
          )}
        </div>

        <div className="d-flex justify-content-end gap-2 w-100">
          <Button
            variant="outline-secondary"
            onClick={() => handleMoveYear("prev")}
          >
            ⏪ {currentMonth.getFullYear() - 1}
          </Button>

          <Button
            variant="outline-secondary"
            onClick={() => handleMoveYear("next")}
          >
            {currentMonth.getFullYear() + 1} ⏩
          </Button>
        </div>
      </Form>

      {/* 달력 */}
      <StyledDayPicker
        mode="default"
        locale={ko}
        onDayClick={handleDayClick}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        disabled={disabled}
        modifiers={{
          highlight: selectedRental
            ? getDateRange(
              new Date(selectedRental.rentalStart),
              new Date(selectedRental.rentalEnd)
            )
            : [],
          today: [today],
          serviceDates: serviceDates.map(d => d.serviceDate),
        }}
        modifiersClassNames={{
          highlight: "highlight-day",
          today: "today-day",
          serviceDates: "service-date-day",
        }}
        formatters={{
          formatWeekdayName: (date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()],
        }}
      />

      {modalOpen && pendingDay && selectedRental && (
        modalType === "add" ? (
          <AddServiceModal
            day={pendingDay}
            selectedRental={selectedRental}
            onClose={(success) => {
              setModalOpen(false);
              setPendingDay(null);
              setModalType("");
              if (success) fetchServiceDates(selectedRental.rentalItemId);
            }}
          />
        ) : (
          <RemoveServiceModal
            day={pendingDay}
            selectedRental={selectedRental}
            onClose={(success) => {
              setModalOpen(false);
              setPendingDay(null);
              setModalType("");
              if (success) fetchServiceDates(selectedRental.rentalItemId);
            }}
          />
        )
      )}
    </div>
  );
}