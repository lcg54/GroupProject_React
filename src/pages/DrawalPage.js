import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DrawalPage({ onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!window.confirm('정말 회원 탈퇴하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      // 탈퇴 API 호출
      // await fetch(...)

      alert('회원 탈퇴가 완료되었습니다.');
      if (onLogout) {
        onLogout();
      }
      navigate('/');
    } catch (error) {
      alert('탈퇴 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>회원 탈퇴</h1>
      <p>탈퇴하시면 모든 정보가 삭제됩니다.</p>
      <button onClick={handleWithdrow} disabled={loading}>
        {loading ? '처리 중...' : '탈퇴하기'}
      </button>
    </div>
  );
}