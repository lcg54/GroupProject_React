import { useNavigate } from "react-router-dom";

export default function RentalCompleted({ user }) {
  const navigate = useNavigate();
  return (
    <>
      <p>주문완료시 표시되는 페이지</p>
      <button onClick={() => {navigate(`/`)}}>HOME</button>
    </>
  );
}