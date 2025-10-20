import './App.css';
import Header from './ui/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './ui/Footer';
import { useState } from 'react';
import { API_BASE_URL } from './config/url';
import axios from 'axios';

export default function App() {
  const [user, setUser] = useState(null);
  
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
      <Header />
      &nbsp; <button onClick={handleTestLogin}>임시로그인(USER)</button>
      &nbsp; {user !== null && (<strong>로그인중(USER)</strong>)}
      <AppRoutes user={user} />
      <Footer />
    </>
  );
}