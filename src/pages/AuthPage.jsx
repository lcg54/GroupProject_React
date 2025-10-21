import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import "./SignupPage.css";

export default function AuthPage({ setUser }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  // 회원가입 폼
  const [signupForm, setSignupForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    address: "",
  });

  // 로그인 폼
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const onSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
  };

  const onLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setProfileFile(null);
      setProfilePreview(null);
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

  const validateSignup = () => {
    if (!signupForm.username.trim()) return "아이디를 입력하세요.";
    if (!signupForm.name.trim()) return "이름을 입력하세요.";
    if (!signupForm.email.trim()) return "이메일을 입력하세요.";
    if (!/^\S+@\S+\.\S+$/.test(signupForm.email)) return "이메일 형식이 올바르지 않습니다.";
    if (signupForm.password.length < 8) return "비밀번호는 특수 문자 포함 최소 8자 이상이어야 합니다.";
    if (signupForm.password !== signupForm.passwordConfirm) return "비밀번호가 일치하지 않습니다.";
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const v = validateSignup();
    if (v) {
      setError(v);
      return;
    }

    const fd = new FormData();
    fd.append("username", signupForm.username);
    fd.append("name", signupForm.name);
    fd.append("email", signupForm.email);
    fd.append("password", signupForm.password);
    fd.append("phone", signupForm.phone);
    fd.append("address", signupForm.address);
    if (profileFile) fd.append("profileImage", profileFile);

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/members`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = (errData && errData.message) || `회원가입 실패: ${res.status}`;
        throw new Error(msg);
      }

      setSuccessMsg("회원가입이 완료되었습니다. 로그인해주세요.");
      setTimeout(() => setIsSignUp(false), 1500);
    } catch (err) {
      setError(err.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setError("아이디와 비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/members/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = (errData && errData.message) || "로그인 실패";
        throw new Error(msg);
      }

      const userData = await res.json();
      if (setUser) {
        setUser(userData);
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className={`auth-container ${isSignUp ? 'right-panel-active' : ''}`}>

        {/* 로그인 폼 */}
        <div className="sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>로그인</h1>
            <div className="social-links">
              <div><a href="#"><i className="fa fa-facebook" aria-hidden="true"></i></a></div>
              <div><a href="#"><i className="fa fa-twitter" aria-hidden="true"></i></a></div>
              <div><a href="#"><i className="fa fa-google" aria-hidden="true"></i></a></div>
            </div>
            <span>또는 계정으로 로그인하세요</span>
            <input
              name="username"
              value={loginForm.username}
              onChange={onLoginChange}
              placeholder="아이디"
              autoComplete="username"
            />
            <input
              name="password"
              type="password"
              value={loginForm.password}
              onChange={onLoginChange}
              placeholder="비밀번호"
              autoComplete="current-password"
            />
            {!isSignUp && error && <div className="error-message">{error}</div>}
            <button className="form_btn" type="submit" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>

        {/* 회원가입 폼 */}
        <div className="sign-up-container">
          <form onSubmit={handleSignup} encType="multipart/form-data">
            <h1>회원가입</h1>
            <div className="social-links">
              <div><a href="#"><i className="fa fa-facebook" aria-hidden="true"></i></a></div>
              <div><a href="#"><i className="fa fa-twitter" aria-hidden="true"></i></a></div>
              <div><a href="#"><i className="fa fa-google" aria-hidden="true"></i></a></div>
            </div>
            <span>또는 이메일로 가입하세요</span>

            <input
              name="username"
              value={signupForm.username}
              onChange={onSignupChange}
              placeholder="아이디"
              autoComplete="username"
            />
            <input
              name="name"
              value={signupForm.name}
              onChange={onSignupChange}
              placeholder="이름"
            />
            <input
              name="email"
              value={signupForm.email}
              onChange={onSignupChange}
              placeholder="이메일"
              autoComplete="email"
            />
            <input
              name="password"
              type="password"
              value={signupForm.password}
              onChange={onSignupChange}
              placeholder="비밀번호 (특수 문자 + 최소 8자)"
              autoComplete="new-password"
            />
            <input
              name="passwordConfirm"
              type="password"
              value={signupForm.passwordConfirm}
              onChange={onSignupChange}
              placeholder="비밀번호 확인"
              autoComplete="new-password"
            />
            <input
              name="phone"
              value={signupForm.phone}
              onChange={onSignupChange}
              placeholder="전화번호 (선택)"
            />
            <input
              name="address"
              value={signupForm.address}
              onChange={onSignupChange}
              placeholder="주소 (선택)"
            />

            <label style={{
              marginTop: 8,
              width: "85%",
              textAlign: "left",
              fontSize: 13,
              color: "#666",
              cursor: "pointer"
            }}>
              프로필 이미지 (선택)
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  padding: 8
                }}
              />
            </label>

            {profilePreview && (
              <div style={{ marginTop: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 12, marginBottom: 6, color: "#666" }}>미리보기:</div>
                <img
                  src={profilePreview}
                  alt="preview"
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 50,
                    border: "3px solid #e0e0e0"
                  }}
                />
              </div>
            )}

            {isSignUp && error && <div className="error-message">{error}</div>}
            {isSignUp && successMsg && <div className="success-message">{successMsg}</div>}

            <button className="form_btn" type="submit" disabled={loading} style={{ marginTop: 12 }}>
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>
        </div>

        {/* 오버레이 패널 */}
        <div className="overlay-container">
          <div className="overlay-left">
            <h1>환영합니다!</h1>
            <p>계정이 있으시면 로그인해주세요</p>
            <button
              className="overlay_btn"
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
                setSuccessMsg(null);
              }}
            >
              로그인
            </button>
          </div>
          <div className="overlay-right">
            <h1>안녕하세요!</h1>
            <p>방문이 처음이시라면 회원가입 후 다양한 상품들을 이용해 보세요.</p>
            <button
              className="overlay_btn"
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
                setSuccessMsg(null);
              }}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}