import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/url";
import "./EditPage.css";

export default function EditPage({ user, setUser }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    address: "",
  });

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // 회원 탈퇴 관련 상태
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);

  // 사용자 정보 불러오기
  useEffect(() => {
    if (!user) {
      navigate("/member/login");
      return;
    }

    setForm({
      username: user.username || "",
      name: user.name || "",
      email: user.email || "",
      password: "",
      passwordConfirm: "",
      phone: user.phone || "",
      address: user.address || "",
    });

    if (user.profileImage) {
      setProfilePreview(`${API_BASE_URL}/images/${user.profileImage}`);
    }
  }, [user, navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setProfileFile(null);
      if (user?.profileImage) {
        setProfilePreview(`${API_BASE_URL}/images/${user.profileImage}`);
      } else {
        setProfilePreview(null);
      }
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    setProfileFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!form.name.trim()) return "이름을 입력하세요.";
    if (!form.email.trim()) return "이메일을 입력하세요.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "이메일 형식이 올바르지 않습니다.";

    if (form.password || form.passwordConfirm) {
      if (form.password.length < 8) return "비밀번호는 최소 8자 이상이어야 합니다.";
      if (form.password !== form.passwordConfirm) return "비밀번호가 일치하지 않습니다.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const fd = new FormData();
    fd.append("username", form.username);
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("address", form.address);

    if (form.password) {
      fd.append("password", form.password);
    }

    if (profileFile) {
      fd.append("profileImage", profileFile);
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/members/edit`, {
        method: "PUT",
        body: fd,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = (errData && errData.message) || `정보 수정 실패: ${res.status}`;
        throw new Error(msg);
      }

      const updatedUser = await res.json();
      const { password, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);

      setSuccessMsg("정보가 성공적으로 수정되었습니다.");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message || "정보 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawError(null);

    if (!withdrawPassword.trim()) {
      setWithdrawError('비밀번호를 입력해주세요.');
      return;
    }

    if (!window.confirm('정말 회원 탈퇴하시겠습니까?\n탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.')) {
      return;
    }

    try {
      setWithdrawLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/members/withdraw`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          password: withdrawPassword,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = (errData && errData.message) || '회원 탈퇴 실패';
        throw new Error(msg);
      }

      alert('회원 탈퇴가 완료되었습니다.');
      setUser(null);
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      setWithdrawError(err.message || '탈퇴 중 오류가 발생했습니다.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="edit-page">
      <div className="wrapper">
        <div className="container">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <h1>내 정보 수정</h1>

            <span>수정할 정보를 입력하세요</span>

            <input
              name="username"
              value={form.username}
              disabled
              placeholder="아이디 (변경 불가)"
              style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
            />

            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="이름"
            />

            <input
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="이메일"
              autoComplete="email"
            />

            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="새 비밀번호 (변경하지 않으려면 비워두세요)"
              autoComplete="new-password"
            />

            <input
              name="passwordConfirm"
              type="password"
              value={form.passwordConfirm}
              onChange={onChange}
              placeholder="새 비밀번호 확인"
              autoComplete="new-password"
            />

            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="전화번호"
            />

            <input
              name="address"
              value={form.address}
              onChange={onChange}
              placeholder="주소"
            />

            <label style={{ marginTop: 8, width: "85%", textAlign: "left", fontSize: 13, color: "#666" }}>
              프로필 이미지
              <input type="file" accept="image/*" onChange={onFileChange} style={{ marginTop: 8 }} />
            </label>

            {profilePreview && (
              <div style={{ marginTop: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 12, marginBottom: 4, color: "#666" }}>현재 프로필:</div>
                <img src={profilePreview} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "2px solid #e0e0e0" }} />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}
            {successMsg && <div className="success-message">{successMsg}</div>}

            <div className="button-group">
              <button className="form_btn btn-primary" type="submit" disabled={loading}>
                {loading ? "수정 중..." : "정보 수정"}
              </button>

              <button
                className="form_btn btn-secondary"
                type="button"
                onClick={() => navigate("/")}
                disabled={loading}
              >
                취소
              </button>

              <button
                className="form_btn btn-danger"
                type="button"
                onClick={() => setShowWithdrawModal(true)}
                disabled={loading}
              >
                회원 탈퇴
              </button>
            </div>
          </form>
        </div>
      </div>

      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>회원 탈퇴</h2>

            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              <p><strong>{user.name}</strong>님, 정말 탈퇴하시겠습니까?</p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px', fontSize: '13px', color: '#999' }}>
                <li>탈퇴 시 모든 개인정보가 삭제됩니다.</li>
                <li>작성한 게시글 및 댓글은 삭제되지 않습니다.</li>
                <li>탈퇴한 정보는 복구할 수 없습니다.</li>
              </ul>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                비밀번호 확인
              </label>
              <input
                type="password"
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
              />
            </div>

            {withdrawError && (
              <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
                {withdrawError}
              </div>
            )}

            <div className="modal-buttons">
              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading}
                className="modal-btn modal-btn-danger"
              >
                {withdrawLoading ? '처리 중...' : '탈퇴하기'}
              </button>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawPassword('');
                  setWithdrawError(null);
                }}
                disabled={withdrawLoading}
                className="modal-btn modal-btn-secondary"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}