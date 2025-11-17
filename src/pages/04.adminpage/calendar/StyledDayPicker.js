import styled from "styled-components";
import { DayPicker } from "react-day-picker";

export const StyledDayPicker = styled(DayPicker)`
  .rdp-months {
    display: flex !important;
    justify-content: center !important;
    max-width: 800px;
    margin: 2rem !important;
  }
    
  .rdp-day {
    width: 100px !important;
    height: 80px !important;
    border-radius: 10px !important;
    padding: 0 !important;
    font-weight: 500 !important;
    cursor: pointer !important;
    font-size: 1rem !important;
  }

  .rdp-day:hover:not(:disabled) {
    transform: scale(1.1) !important;
    background-color: #e2e6ea !important;
  }

  .rdp-day.today-day {
    background-color: #007bffff !important;
    color: #004085 !important;
  }

  .rdp-day.highlight-day {
    background-color: #d4edda !important;
    color: #155724 !important;
  }

  .rdp-day.service-date-day {
    background-color: #fff3cd !important;
    color: #856404 !important;
  }

  .rdp-day:disabled {
    color: #ccc !important;
    cursor: not-allowed !important;
    background-color: transparent !important;
  }

  @media (max-width: 768px) {
    .rdp-months {
      flex-direction: column !important; /* 모바일에서는 한 달씩 세로로 정렬 */
      align-items: center !important;
    }

    .rdp-day {
      padding: 0.4rem !important;
      font-size: 0.85rem !important;
    }
  }
`;
