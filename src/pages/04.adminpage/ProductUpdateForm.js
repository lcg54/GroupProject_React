import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Container, Form, Button, Card, Row, Col, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { CATEGORIES } from "../../constant/categories";
import { BRANDS } from "../../constant/brands";

// 상품 수정 페이지 (디자인 변경)
export default function ProductUpdateForm({ user }) {
  const { id } = useParams();
  const [form, setForm] = useState({ name: "", category: "", brand: "", description: "", price: "", totalStock: "" });

  // 이미지 상태
  const [mainImages, setMainImages] = useState([]);
  const [mainIndex, setMainIndex] = useState(0); // 대표 이미지
  const [mainPreviews, setMainPreviews] = useState([]);
  const [subImages, setSubImages] = useState([]);
  const [subPreviews, setSubPreviews] = useState([]);
  const [detailImages, setDetailImages] = useState([]);
  const [detailPreviews, setDetailPreviews] = useState([]);

  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const allPreviews = [...mainPreviews, ...subPreviews];

  const deleteMainSub = [];
  const deleteDetail = [];

  // 관리자 체크
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const userRole = user?.role || storedUser?.role;
    if (userRole !== "ADMIN") {
      alert("관리자만 접근 가능한 페이지입니다.");
      navigate(`/member/login`);
    }
  }, [user]);

  // 상품 로드
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/product/category/${id}`, { withCredentials: true });
        console.log("서브 이미지 배열: ", data.images);
        setForm({
          name: data.product.name || "",
          category: data.product.category || "",
          brand: data.product.brand || "",
          description: data.product.description || "",
          price: String(data.product.price ?? ""),
          totalStock: String(data.product.totalStock ?? "")
        });
        const mainList = [];
        const subList = [];
        const detailList = [];

        if (Array.isArray(data.images.main)) {
          data.images.main.forEach(f => mainList.push(f.startsWith("http") ? f : `${API_BASE_URL}${f}`));
        }

        if (Array.isArray(data.images.sub)) {
          data.images.sub.forEach(f => subList.push(f.startsWith("http") ? f : `${API_BASE_URL}${f}`));
        }

        if (Array.isArray(data.images.detail)) {
          data.images.detail.forEach(f => detailList.push(f.startsWith("http") ? f : `${API_BASE_URL}${f}`));
        }

        setMainImages(mainList);
        setMainPreviews(mainList);
        setSubImages(subList);
        setSubPreviews(subList);
        setDetailImages(detailList);
        setDetailPreviews(detailList);

      } finally {
        setLoading(false);
      }
    })();
  }, [user, id]);

  // 공통 onChange: 특정 키만 교체
  const onChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // 대표 및 서브 이미지 선택 및 추가
  const handleMainImages = (event) => {
    const newFiles = Array.from(event.target.files || []);
    const combined = [...mainImages, ...newFiles];

    if (combined.length > 5) {
      alert("대표 및 서브 이미지는 최대 5장까지 가능합니다.");
      return;
    }

    setMainImages(combined);  // 대표 및 서브 이미지 배열로 설정
    setMainPreviews(combined.map((file) => URL.createObjectURL(file)));  // 미리보기 업데이트
  };

  // 서브 이미지 선택
  const handleSubImages = (event) => {
    const newFiles = Array.from(event.target.files || []);
    const combined = [...subImages, ...newFiles];

    if (combined.length > 5) {
      alert("서브 이미지는 최대 5장까지 가능합니다.");
      return;
    }

    setSubImages(combined);
    setSubPreviews(combined.map((file) => URL.createObjectURL(file)));
  };

  // 대표 이미지 변경 로직 (배지 클릭 시)
  const handleSetMainImage = (idx) => {
    // 대표 이미지로 변경
    const updatedImages = [...mainImages];
    const selectedImage = updatedImages.splice(idx, 1); // 선택한 이미지를 제거
    updatedImages.unshift(selectedImage[0]); // 맨 앞으로 추가

    setMainImages(updatedImages);  // 이미지 배열 업데이트
    setMainPreviews(updatedImages.map((file) => URL.createObjectURL(file)));  // 미리보기 업데이트
    setMainIndex(0);  // 대표 이미지를 첫 번째로 설정
  };

  // 이미지 삭제 핸들러 수정
  const handleRemoveImage = (idx, isMain) => {
    if (isMain) {
      setMainImages(prev => prev.filter((_, i) => i !== idx));
      setMainPreviews(prev => prev.filter((_, i) => i !== idx));
      if (mainIndex === idx) setMainIndex(0); // 대표 이미지 삭제 시 첫 번째로 변경
    } else {
      const targetIdx = idx;
      setSubImages(prev => prev.filter((_, i) => i !== targetIdx));
      setSubPreviews(prev => prev.filter((_, i) => i !== targetIdx));
    }
  };


  // 상세 이미지 추가
  const handleDetailImages = (event) => {
    const newFiles = Array.from(event.target.files || []);
    const combined = [...detailImages, ...newFiles];

    if (combined.length > 100) {
      alert("상세 이미지는 최대 100장까지 가능합니다.");
      return;
    }

    setDetailImages(combined);  // 상세 이미지 배열 설정
    setDetailPreviews(combined.map(f => f instanceof File ? URL.createObjectURL(f) : f));  // 상세 이미지 미리보기 업데이트
  };

  // 상세 이미지 삭제
  const handleRemoveDetailImage = (idx) => {
    setDetailImages(prev => prev.filter((_, i) => i !== idx));
    setDetailPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // FormData 생성
  const buildFormData = () => {
    const formData = new FormData();

    // 기존 폼 데이터 추가
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // deleteMainSub와 deleteDetail을 배열로 추가
    formData.append("deleteMainSub", JSON.stringify(deleteMainSub || []));  // 기본값 빈 배열 추가
    formData.append("deleteDetail", JSON.stringify(deleteDetail || []));

    return formData;
  };


  // 상품 수정 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = buildFormData();
    console.log("FormData", formData);

    // deleteMainSub와 deleteDetail을 올바른 형태로 처리하여 FormData에 추가
    formData.append('deleteMainSub', JSON.stringify(deleteMainSub));
    formData.append('deleteDetail', JSON.stringify(deleteDetail));

    try {
      await axios.put(`${API_BASE_URL}/product/${id}/${user.id}`, formData, { withCredentials: true });
      alert("수정 완료!");
    } catch (error) {
      console.error(error);
      alert("수정 실패!");
    }
  };

  // 상품 삭제
  const handleDelete = async () => {
    if (!window.confirm(`정말 ${form.name} (${id}) 을(를) 삭제하시겠습니까?`)) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/product/${id}/${user.id}`, { withCredentials: true });
      alert(`${form.name} (${id})이 삭제되었습니다.`);
      navigate("/product/list");
    } catch (err) {
      alert("삭제 실패: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // 수정 내역 보기
  const openLogs = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/product/logs/changes`, { withCredentials: true });
      setLogs(Array.isArray(data) ? data : []);
      setShowLogs(true);
    } catch {
      setLogs([]);
      setShowLogs(true);
    }
  };

  if (loading || !user) return null;
  return (
    <Container style={{ maxWidth: 700 }} className="py-4">
      <Card className="shadow-lg border-0">
        <Card.Header className="text-center fw-bold bg-light">상품 수정</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* 상품명 */}
            <Form.Group className="mb-3">
              <Form.Label>상품명</Form.Label>
              <Form.Control type="text" value={form.name} onChange={(e) => onChange("name", e.target.value)} />
            </Form.Group>

            {/* 카테고리/브랜드 */}
            <Row>
              <Col md={6}>
                <Form.Label>카테고리</Form.Label>
                <Form.Select value={form.category} onChange={(e) => onChange("category", e.target.value)}>
                  <option value="">선택</option>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>브랜드</Form.Label>
                <Form.Select value={form.brand} onChange={(e) => onChange("brand", e.target.value)}>
                  <option value="">선택</option>
                  {BRANDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </Form.Select>
              </Col>
            </Row>

            {/* 상세 설명 */}
            <Form.Group className="mt-3">
              <Form.Label>상세설명</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.description} onChange={(e) => onChange("description", e.target.value)} />
            </Form.Group>

            {/* 가격/수량 */}
            <Row className="mt-3">
              <Col md={6}>
                <Form.Label>가격</Form.Label>
                <Form.Control type="text" value={form.price} onChange={(e) => onChange("price", e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>총 수량</Form.Label>
                <Form.Control type="text" value={form.totalStock} onChange={(e) => onChange("totalStock", e.target.value)} />
              </Col>
            </Row>

            {/* 대표 및 서브 이미지 */}
            <Form.Group className="mt-3">
              <Form.Label>대표 및 서브 이미지 (최대 5장)</Form.Label>
              <Form.Control type="file" multiple accept="image/*" onChange={handleMainImages} />
              {allPreviews.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                  {allPreviews.map((img, idx) => {
                    const isMainImage = idx < mainPreviews.length; // 대표 이미지 여부 확인
                    const isSelectedMain = idx === mainIndex; // 현재 대표 이미지로 선택된 이미지 여부
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setMainIndex(idx); // 클릭한 이미지를 대표 이미지로 설정
                        }}
                        style={{
                          position: "relative",
                          width: "100px",
                          height: "100px",
                          cursor: "pointer",
                          border: isSelectedMain ? "3px solid #007bff" : "1px solid #ccc", // 대표 이미지 선택 시 강조
                        }}
                      >
                        <img
                          src={img}
                          alt={`이미지 ${idx + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                        {/* '대표' 배지 표시 */}
                        <div
                          style={{
                            position: "absolute",
                            top: "4px",
                            left: "4px",
                            backgroundColor: isSelectedMain ? "#007bff" : "#888",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            zIndex: 10,
                          }}
                        >
                          대표
                        </div>
                        {/* 삭제 버튼 */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation(); // 이미지 클릭과 삭제 버튼 클릭 충돌 방지
                            handleRemoveImage(idx, isMainImage); // 삭제 핸들러에 추가
                          }}
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            color: "white",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "14px",
                            zIndex: 9999,
                          }}
                        >
                          ✕
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Form.Group>


            {/* 상세 이미지 */}
            <Form.Group className="mt-3">
              <Form.Label>상세 이미지</Form.Label>
              <Form.Control type="file" multiple accept="image/*" onChange={handleDetailImages} />
              {detailPreviews.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                  {detailPreviews.map((img, idx) => (
                    <div key={idx} style={{ position: "relative", width: "100px", height: "100px" }}>
                      <img src={img} alt={`상세 이미지 ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                      <div onClick={() => handleRemoveDetailImage(idx)} style={{ position: "absolute", top: "4px", right: "4px", backgroundColor: "rgba(0,0,0,0.6)", color: "white", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: "bold", fontSize: "14px", zIndex: 9999 }}>✕</div>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            {/* 버튼 */}
            <div className="d-flex justify-content-center gap-2 mt-3">
              <Button variant="secondary" onClick={() => navigate("/product/list")}>목록으로</Button>
              <Button variant="outline-dark" onClick={openLogs}>수정/삭제 내역</Button>
              <Button type="submit" variant="outline-primary" disabled={saving || deleting}>{saving ? "수정 중..." : "수정"}</Button>
              <Button variant="outline-danger" disabled={saving || deleting} onClick={handleDelete}>삭제</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* 수정/삭제 내역 모달 */}
      <Modal show={showLogs} onHide={() => setShowLogs(false)} centered>
        <Modal.Header closeButton><Modal.Title>수정/삭제 내역</Modal.Title></Modal.Header>
        <Modal.Body>
          {logs.length > 0 ? (
            <ul className="list-unstyled mb-0">
              {logs.map((log, i) => (
                <li key={i} className="mb-2">
                  {log.productName} <small className="text-muted">({new Date(log.createdAt).toLocaleString("ko-KR")})</small>
                  <span> - {log.adminName}</span>
                </li>
              ))}
            </ul>
          ) : <div className="text-muted text-center">내역이 없습니다.</div>}
        </Modal.Body>
      </Modal>
    </Container>
  );
}