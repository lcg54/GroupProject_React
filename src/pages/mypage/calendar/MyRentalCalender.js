import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import styled from "styled-components";

// 부모 영역(예: MyPage 내부 Row나 Container)을 가득 채움
const CalendarWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 80vh; /* 페이지 높이에 꽉 차게 */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fdf6e3;
  border-radius: 10px;
  padding: 1rem;
`;

// DayPicker 자체를 키우기 위해 내부 스타일 조정
const StyledDayPicker = styled(DayPicker)`
  width: 100%;
  max-width: 1000px; /* 너무 넓어지지 않게 제한 */
  height: auto;

  /* 날짜 셀 크기 조정 */
  .rdp-day {
    width: 100px;
    height: 80px;
    font-size: 1.1rem;
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

function MyCalendar() {
    const [selected, setSelected] = useState(null);

    const startDate = new Date(2025, 9, 20);
    const endDate = new Date(2025, 9, 30);

    const isDisabled = (date) => date < startDate || date > endDate;

    return (
        <CalendarWrapper>
            <StyledDayPicker
                mode="single"
                selected={selected}
                onSelect={setSelected}
                disabled={isDisabled}
                modifiers={{
                    highlight: { from: startDate, to: endDate },
                }}
                modifiersClassNames={{
                    highlight: "highlight",
                }}
            />
        </CalendarWrapper>
    );
}

export default MyCalendar;
