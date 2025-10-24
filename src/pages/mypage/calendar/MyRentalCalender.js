import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import styled from "styled-components";
import "./MyRentalCalender.css";

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

export default function MyCalendar() {
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
                    selected: selected ? [selected] : [],
                }}
                modifiersClassNames={{
                    highlight: "highlight-day",
                    selected: "selected-day",
                }}
            />
        </CalendarWrapper>
    );
}
