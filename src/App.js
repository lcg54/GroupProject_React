import './App.css';
import Header from './ui/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './ui/Footer';
import AppWrapper from "./routes/AppWrapper";
import { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState(null);

  // 로컬스토리지에서 사용자 정보 불러오기 (새로고침 시 로그인 유지)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // 사용자 정보 변경 시 로컬스토리지에 저장
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // 로그아웃 핸들러
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AppWrapper className="app-container">
      {/* 헤더 + 라우트 영역 */}

      <Header user={user} onLogout={handleLogout} />
      <div className="content">
        <AppRoutes user={user} setUser={setUser} handleLogout={handleLogout} />
      </div>

      {/* 푸터 항상 맨 아래 */}
      <Footer />
    </AppWrapper>
  );
}
