import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage({ onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (onLogout) {
      onLogout();
    }
    navigate('/member/login');
  }, [onLogout, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>로그아웃 중...</h2>
    </div>
  );
}