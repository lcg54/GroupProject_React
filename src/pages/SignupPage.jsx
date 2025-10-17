import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

export default function SignupPage() {
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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const validate = () => {
    if (!form.username.trim()) return "아이디를 입력하세요.";
    if (!form.name.trim()) return "이름을 입력하세요.";
    if (!form.email.trim()) return "이메일을 입력하세요.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "이메일 형식이 올바르지 않습니다.";
    if (form.password.length < 8) return "비밀번호는 최소 8자 이상이어야 합니다.";
    if (form.password !== form.passwordConfirm) return "비밀번호가 일치하지 않습니다.";
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
    fd.append("password", form.password);
    fd.append("phone", form.phone);
    fd.append("address", form.address);
    if (profileFile) fd.append("profileImage", profileFile);

    try {
      setLoading(true);
      const res = await fetch("/api/members", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = (errData && errData.message) || `회원가입 실패: ${res.status}`;
        throw new Error(msg);
      }

      setSuccessMsg("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      setTimeout(() => navigate("/member/login"), 1000);
    } catch (err) {
      setError(err.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      {/* right-panel-active 클래스를 추가하여 회원가입 폼이 보이도록 */}
      <div className="container right-panel-active">

        {/* 로그인 컨테이너 (왼쪽에 숨겨짐) */}
        <div className="sign-in-container">
          <form>
            <h1>로그인</h1>
          </form>
        </div>

        {/* 회원가입 컨테이너 (오른쪽에 표시됨) */}
        <div className="sign-up-container">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <h1>회원가입</h1>

            <div className="social-links">
              <div><a href="#"><i className="fa fa-facebook" aria-hidden="true"></i></a></div>
              <div><a href="#"><i className="fa fa-twitter" aria-hidden="true"></i></a></div>
              <div><a href="#"><i className="fa fa-linkedin" aria-hidden="true"></i></a></div>
            </div>

            <span>또는 이메일로 가입하세요</span>

            <input
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="아이디 (로그인용)"
              autoComplete="username"
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
              placeholder="비밀번호 (특수문자 포함, 최소 8자)"
              autoComplete="new-password"
            />

            <input
              name="passwordConfirm"
              type="password"
              value={form.passwordConfirm}
              onChange={onChange}
              placeholder="비밀번호 확인"
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

            <label style={{ marginTop: 8, width: "85%", textAlign: "left", fontSize: 13 }}>
              프로필 이미지 (선택)
              <input type="file" accept="image/*" onChange={onFileChange} style={{ marginTop: 8 }} />
            </label>

            {profilePreview && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, marginBottom: 4 }}>미리보기:</div>
                <img src={profilePreview} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8 }} />
              </div>
            )}

            {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
            {successMsg && <div style={{ color: "green", marginTop: 10 }}>{successMsg}</div>}

            <button className="form_btn" type="submit" disabled={loading} style={{ marginTop: 14 }}>
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>
        </div>

        {/* 오버레이 컨테이너 */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-left">
              <h1>환영합니다!</h1>
              <p>계정이 있으시면 로그인해주세요.</p>
              <button className="overlay_btn" type="button" onClick={() => navigate("/member/login")}>
                로그인
              </button>
            </div>
            <div className="overlay-right">
              <h1>회원가입</h1>
              <p>아래 폼을 작성하여 회원가입을 완료하세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}