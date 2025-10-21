import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';

const API_BASE_URL = "http://localhost:9000";

export default function DrawalPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // 로그인 안 한 경우 리다이렉트
  React.useEffect(() => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/member/login');
    }
  }, [user, navigate]);

  const handleWithdraw = async () => {
    setError(null);

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    if (!window.confirm('정말 회원 탈퇴하시겠습니까?\n탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.')) {
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/members/withdraw`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          password: password,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = (errData && errData.message) || '회원 탈퇴 실패';
        throw new Error(msg);
      }

      alert('회원 탈퇴가 완료되었습니다.');

      // 로그아웃 처리
      if (onLogout) {
        onLogout();
      }

      navigate('/');
    } catch (err) {
      setError(err.message || '탈퇴 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="wrapper">
      <div className="container">
        <div className="sign-in-container" style={{ maxWidth: '450px', margin: '0 auto' }}>
          <form onSubmit={(e) => { e.preventDefault(); handleWithdraw(); }}>
            <h1 style={{ color: '#dc3545' }}>회원 탈퇴</h1>

            <div style={{ marginTop: 20, marginBottom: 20, textAlign: 'left', padding: '0 20px' }}>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#666' }}>
                <strong>{user.name}</strong>님, 정말 탈퇴하시겠습니까?
              </p>
              <ul style={{ fontSize: 13, color: '#999', paddingLeft: 20, marginTop: 10 }}>
                <li>탈퇴 시 모든 개인정보가 삭제됩니다.</li>
                <li>작성한 게시글 및 댓글은 삭제되지 않습니다.</li>
                <li>탈퇴한 정보는 복구할 수 없습니다.</li>
              </ul>
            </div>

            <span style={{ fontSize: 14, marginBottom: 10 }}>
              본인 확인을 위해 비밀번호를 입력해주세요
            </span>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
              style={{ marginTop: 10 }}
            />

            {error && (
              <div style={{ color: 'red', marginTop: 10, fontSize: 14 }}>
                {error}
              </div>
            )}

            <button
              className="form_btn"
              type="submit"
              disabled={loading}
              style={{
                marginTop: 20,
                backgroundColor: '#dc3545',
                border: 'none'
              }}
            >
              {loading ? '처리 중...' : '탈퇴하기'}
            </button>

            <button
              className="form_btn"
              type="button"
              onClick={() => navigate('/')}
              disabled={loading}
              style={{
                marginTop: 10,
                backgroundColor: '#6c757d',
                border: 'none'
              }}
            >
              취소
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}