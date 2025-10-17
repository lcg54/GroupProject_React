import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

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

  // 사용자 정보 불러오기
  useEffect(() => {
    if (!user) {
      // 로그인하지 않은 경우 로그인 페이지로 이동
      navigate("/member/login");
      return;
    }

    // 기존 정보로 폼 초기화
    setForm({
      username: user.username || "",
      name: user.name || "",
      email: user.email || "",
      password: "",
      passwordConfirm: "",
      phone: user.phone || "",
      address: user.address || "",
    });

    // 기존 프로필 이미지가 있으면 표시
    if (user.profileImage) {
      setProfilePreview(user.profileImage);
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
      // 기존 이미지 유지
      if (user?.profileImage) {
        setProfilePreview(user.profileImage);
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

    // 비밀번호를 변경하려는 경우에만 검증
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
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("address", form.address);

    // 비밀번호를 입력한 경우에만 전송
    if (form.password) {
      fd.append("password", form.password);
    }

    // 새 프로필 이미지를 선택한 경우에만 전송
    if (profileFile) {
      fd.append("profileImage", profileFile);
    }

    try {
      setLoading(true);
      const res = await fetch("/api/members/edit", {
        method: "PUT",
        body: fd,
        credentials: "include", // 쿠키 포함
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = (errData && errData.message) || `정보 수정 실패: ${res.status}`;
        throw new Error(msg);
      }

      const updatedUser = await res.json();

      // 사용자 정보 업데이트
      setUser(updatedUser);

      setSuccessMsg("정보가 성공적으로 수정되었습니다.");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message || "정보 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="container right-panel-active">
        {/* 왼쪽 빈 컨테이너 */}
        <div className="sign-in-container">
          <form>
            <h1>정보 수정</h1>
          </form>
        </div>

        {/* 정보 수정 컨테이너 */}
        <div className="sign-up-container">
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

            <label style={{ marginTop: 8, width: "85%", textAlign: "left", fontSize: 13 }}>
              프로필 이미지
              <input type="file" accept="image/*" onChange={onFileChange} style={{ marginTop: 8 }} />
            </label>

            {profilePreview && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, marginBottom: 4 }}>현재 프로필:</div>
                <img src={profilePreview} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8 }} />
              </div>
            )}

            {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
            {successMsg && <div style={{ color: "green", marginTop: 10 }}>{successMsg}</div>}

            <button className="form_btn" type="submit" disabled={loading} style={{ marginTop: 14 }}>
              {loading ? "수정 중..." : "정보 수정"}
            </button>

            <button
              className="form_btn"
              type="button"
              onClick={() => navigate("/")}
              style={{ marginTop: 10, backgroundColor: "#6c757d" }}
            >
              취소
            </button>
          </form>
        </div>

        {/* 오버레이 컨테이너 */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-left">
              <h1>내 정보 수정</h1>
              <p>변경할 정보를 입력해주세요.</p>
            </div>
            <div className="overlay-right">
              <h1>계정 관리</h1>
              <p>개인 정보를 안전하게 관리하세요.</p>
              <button className="overlay_btn" type="button" onClick={() => navigate("/")}>
                홈으로
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}