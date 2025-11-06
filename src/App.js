import './App.css';
import Header from './ui/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './ui/Footer';
import AppWrapper from "./routes/AppWrapper";
import { useState, useEffect } from 'react';
import { API_BASE_URL } from './config/url';
import axios from "axios";

axios.defaults.withCredentials = true;

export default function App() {
  const [user, setUser] = useState(null);

  // -------------------------
  // 초기 로드: 서버 세션 확인 + 로컬/세션 스토리지 복원
  // -------------------------
  useEffect(() => {
    let mounted = true;

    // 빠른 복원을 위해 sessionStorage 먼저 확인 (동일 세션 내)
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        if (mounted) {
          setUser(parsed);
        }

        return;
      } catch (e) {
        sessionStorage.removeItem('user');
      }
    }

    // 서버 세션 확인 함수
    const checkServerSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/members/check-session`, {
          method: 'GET',
          credentials: 'include', // <- 중요: 서버 세션 쿠키를 전송/수신
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!mounted) return;

        if (res.ok) {
          const userData = await res.json().catch(() => null);
          if (userData) {
            setUser(userData);

            sessionStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.setItem('browserSession', 'active');
            return;
          }
        }
      } catch (e) {
        // 네트워크 오류 등 무시하고 로컬 저장소 fallback 시도
        console.warn('check-session failed:', e);
      }

      // 서버에 세션 정보가 없거나 실패한 경우: 기존 localStorage fallback 로직
      const savedUser = localStorage.getItem('user');
      const browserSession = sessionStorage.getItem('browserSession');

      if (savedUser && !browserSession) {
        // 다른 브라우저 세션에서 남은 오래된 localStorage 정보라면 제거
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

      // 표시용 플래그 (한 세션 내임을 표시)
      sessionStorage.setItem('browserSession', 'active');
    };

    checkServerSession();

    return () => {
      mounted = false;
    };
  }, []);

  // -------------------------
  // user 상태가 변경될 때 local/session 저장
  // -------------------------
  useEffect(() => {
    if (user) {
      const userStr = JSON.stringify(user);
      try {
        localStorage.setItem('user', userStr);
      } catch (e) {
        console.warn('localStorage set failed', e);
      }
      try {
        sessionStorage.setItem('user', userStr);
      } catch (e) {
        console.warn('sessionStorage set failed', e);
      }
    } else {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('browserSession');
    }
  }, [user]);

  // -------------------------
  // 브라우저 닫을 때(언로드) 로그아웃 시도
  // - navigator.sendBeacon는 credentials 포함을 보장하지 않으므로
  //   fetch keepalive를 사용. (브라우저에 따라 동작 차이 있을 수 있음)
  // -------------------------
  useEffect(() => {
    const handleBeforeUnload = (ev) => {
      if (user) {
        try {
          // keepalive 요청(브라우저가 종료되어도 전송을 시도)
          // credentials 포함하여 서버에 세션 무효화 요청
          fetch(`${API_BASE_URL}/api/members/logout`, {
            method: 'POST',
            credentials: 'include',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // 빈 바디라도 보냄
          }).catch(() => {

          });
        } catch (e) {

          try {
            navigator.sendBeacon(`${API_BASE_URL}/api/members/logout`);
          } catch (ee) {

          }
        }
      }

    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  // -------------------------
  // 명시적 로그아웃 핸들러 (버튼 클릭 등)
  // -------------------------
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/members/logout`, {
        method: 'POST',
        credentials: 'include', // <- 서버 세션 쿠키 전송
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
      // 그래도 로컬 세션 정리는 해주자
    } finally {
      setUser(null);
      try { localStorage.removeItem('user'); } catch { }
      try { sessionStorage.removeItem('user'); } catch { }
      try { sessionStorage.removeItem('browserSession'); } catch { }
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