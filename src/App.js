import './App.css';
import Header from './ui/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './ui/Footer';
import AppWrapper from "./routes/AppWrapper";
import { useState, useEffect } from 'react';
import { API_BASE_URL } from './config/url';

export default function App() {
  const [user, setUser] = useState(null);

  // 초기 로드 시 사용자 정보 불러오기
  useEffect(() => {
    // sessionStorage 확인 (같은 세션 내)
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      try {
        setUser(JSON.parse(sessionUser));
        return;
      } catch (error) {
        sessionStorage.removeItem('user');
      }
    }

    // localStorage 확인 (브라우저 재시작 감지용)
    const savedUser = localStorage.getItem('user');
    const browserSession = sessionStorage.getItem('browserSession');

    if (savedUser && !browserSession) {
      // 새로운 브라우저 세션 = 이전 세션 종료됨
      localStorage.removeItem('user');
      return;
    }

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        sessionStorage.setItem('user', savedUser);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }

    // 현재 브라우저 세션 표시
    sessionStorage.setItem('browserSession', 'active');
  }, []);

  // 사용자 정보 변경 시 저장
  useEffect(() => {
    if (user) {
      const userStr = JSON.stringify(user);
      localStorage.setItem('user', userStr);
      sessionStorage.setItem('user', userStr);
    } else {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
  }, [user]);

  // 브라우저 닫을 때 로그아웃 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        // 로그아웃 API 호출
        const blob = new Blob([JSON.stringify({})], { type: 'application/json' });
        navigator.sendBeacon(`${API_BASE_URL}/api/members/logout`, blob);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/members/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('browserSession');
      alert('로그아웃 되었습니다.');
    }
  };

  return (
    <AppWrapper className="app-container">
      <Header user={user} onLogout={handleLogout} />
      <div className="content">
        <AppRoutes user={user} setUser={setUser} handleLogout={handleLogout} />
      </div>
      <Footer />
    </AppWrapper>
  );
}
