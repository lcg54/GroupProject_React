import axios from "axios";
import { API_BASE_URL } from "../config/url";

export default function Login({ user, setUser }) {

  // 로그인(임시)
  const handleTestLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login/test`);
      const userData = response.data;
      setUser(userData);
      alert(`${userData.name}님으로 로그인되었습니다.`);
    } catch (error) {
      alert("테스트 로그인 실패");
    }
  };

  return (
    <>
      <button onClick={handleTestLogin}>임시로그인(USER)</button>
      {user !== null && (<strong>로그인중(USER)</strong>)}
    </>
  );
}