import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

export default function LoginPage({ setUser }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.username.trim() || !form.password.trim()) {
      setError("아이디와 비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/members/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = (errData && errData.message) || "로그인 실패";
        throw new Error(msg);
      }

      const userData = await res.json();
      setUser(userData);
      navigate("/");
    } catch (err) {
      setError(err.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="container">
        {/* 로그인 폼 */}
        <div className="sign-in-container">
          <form onSubmit={handleSubmit}>
            <h1>로그인</h1>

            <div className="social-links">
              <div><a href="#"><i className="fa fa-facebook" aria-hidden="true"></i></a></div>
              <div><a href="#"><i className="fa fa-twitter" aria-hidden="true"></i></a></div>
              <div><a href="#"><i className="fa fa-linkedin" aria-hidden="true"></i></a></div>
            </div>

            <span>또는 이메일로 로그인하세요</span>

            <input
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="아이디"
              autoComplete="username"
            />

            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="비밀번호"
              autoComplete="current-password"
            />

            {error && <div style={{ color: "red", marginTop: 10, fontSize: 14 }}>{error}</div>}

            <button className="form_btn" type="submit" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>

        {/* 오버레이 컨테이너 */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-left">
              <h1>환영합니다!</h1>
              <p>개인 정보를 입력하고 여정을 시작하세요</p>
              <button
                className="overlay_btn"
                type="button"
                onClick={() => navigate("/member/signup")}
              >
                회원가입
              </button>
            </div>
            <div className="overlay-right">
              <h1>안녕하세요!</h1>
              <p>회원가입하고 더 많은 기능을 이용해보세요</p>
              <button
                className="overlay_btn"
                type="button"
                onClick={() => navigate("/member/signup")}
              >
                회원가입
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}