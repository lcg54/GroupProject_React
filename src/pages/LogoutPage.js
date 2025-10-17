import axios from "axios";
import { useEffect } from "react";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

function LogoutPage({ onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    const url = `${API_BASE_URL}/member/logout`;

    axios.post(url)
      .then(() => {
        localStorage.removeItem('user');
        console.log('로그아웃 성공');

        if (onLogout) {
          onLogout();
        }

        navigate(`/member/login`);
      })
      .catch((error) => {
        console.log('로그아웃 실패', error);
      });
  }, []);

  return <>로그아웃 중...</>;
}

export default LogoutPage;
