import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Container, Form, Button, Card, Row, Col, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { FILTER_OPTIONS } from "../02.product/ProductListFilter";
import { prettyLabel } from "../../util/replace"

// 상품 수정 페이지
export default function ProductUpdateForm({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const warned = useRef(false);

  // 화면 상태
  const [form, setForm] = useState({ name: "", category: "", brand: "", description: "", price: "", totalStock: "" });
  
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  // 숫자 형태의 id인지 간단 검증
  const validId = /^\d+$/.test(id || "");

  useEffect(() => {
    const isAdmin = user && user.role === "ADMIN";
    const isBlocked = !isAdmin;

    if(user === undefined) return;
    if (isBlocked && !warned.current){
    if (user === null) {
      const timeoutId = setTimeout(() => {
        warned.current = true;
        alert("접근 권한이 없습니다.");
        navigate("/", { replace: true });
      },100);
      return () => clearTimeout(timeoutId);
    }
      warned.current = true;
      alert("접근 권한이 없습니다.");
      navigate("/",{ replace: true});
  }
  }, [user, navigate]);

  // 상품 로드
  useEffect(() => {
    if (user === undefined) return;
    const isBlocked = !(user && user.role && String(user.role).toUpperCase() === "ADMIN");
    if (isBlocked) return;
    if(!validId){
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/product/${id}`, { withCredentials: true });
        setForm({
          name: data.name || "",
          category: data.category || "",
          brand: data.brand || "",
          description: data.description || "",
          price: String(data.price ?? ""),
          totalStock: String(data.totalStock ?? "")
        });

        // 기존 이미지 URL 세팅
        let urls = [];
        if (Array.isArray(data.images) && data.images.length) {
          urls = data.images.map((fn) => (String(fn).startsWith("http") ? fn : `${API_BASE_URL}/images/${fn}`));
        } else if (data.mainImage) {
          urls = [data.mainImage.startsWith("http") ? data.mainImage : `${API_BASE_URL}/images/${data.mainImage}`];
        }
        setExistingImages(urls);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, id]);

  const handleChangeField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // 파일 선택(새 이미지 업로드)
  const handlePickFiles = (event) => {
    const files = Array.from(event.target.files || []);
    setNewFiles(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  };

  // 기존 이미지 하나 제거
  const handleRemoveExistingImage = (url) => setExistingImages((arr) => arr.filter((u) => u !== url));
  const handleRemoveNewImageAt = (index) => {
    setNewFiles((prev) => prev.filter((_, idx) => idx !== index));
    setPreviewUrls((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index]); // 메모리 누수 방지
      copy.splice(index, 1);
      return copy;
    });
  };

  // 서버에 보낼 FormData 생성
  const buildFormData = () => {
    const formdata = new FormData();
    formdata.append("name", form.name);
    formdata.append("category", form.category);
    formdata.append("brand", form.brand);
    if (form.description) formdata.append("description", form.description);
    formdata.append("price", form.price || "0");
    formdata.append("totalStock", form.totalStock || "0");

    // 기존 이미지는 파일명이 아니라 URL 형태라서, /images/ 뒤의 실제 파일명만 추출
    const existingFileNames = existingImages.map((url) => {
      const idx = url.lastIndexOf("/images/");
      return idx >= 0 ? url.substring(idx + 8) : url;
    });
    formdata.append("existingImages", JSON.stringify(existingFileNames));
    
    // 새로 업로드한 파일 추가
    newFiles.forEach((file) => formdata.append("images", file));
    return formdata;
  };

  // 상품 수정 요청
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.category || !form.brand || form.price === "" || form.totalStock === "") {
      alert("필수 항목을 입력하세요.");
      return;
    }
    if (!window.confirm(`${form.name} (${id}) 을(를) 수정하시겠습니까?`)) return;

    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/product/${id}`, buildFormData(), { withCredentials: true });
      alert(`${form.name} (${id}) 을(를) 수정 완료 했습니다.`);
      navigate("/product/list");
    } finally {
      setSaving(false);
    }
  };

  // 상품 삭제 요청
  const handleDelete = async () => {
    if (!window.confirm(`정말 ${form.name} (${id}) 을(를) 삭제하시겠습니까?`)) return;
    setDeleting(true);
    try {
      const {data} = await axios.delete(`${API_BASE_URL}/product/${id}`, { withCredentials: true });
      // 성공 
    alert(`${form.name} (${id})이 삭제되었습니다.`);
    navigate("/product/list");
  } catch (error) {
    console.error("상품 삭제 실패", error);
    
    if(error.response?.status === 400){
    alert("주문이 들어온 상품은 삭제 할 수 없습니다.");
    }
    else{
      alert("상품 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  } finally {
    setDeleting(false);
  }
};

  // 수정/삭제 내역 모달 열기
  const handleOpenLogs = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/product/logs/changes`, { withCredentials: true });
    setLogs(Array.isArray(data) ? data : []);
    setShowLogs(true);
  };

  // 로딩 중이거나 user 정보가 아직 없으면 렌더링하지 않음
  if (loading || !user) return null;

  return (
    <Container style={{ maxWidth: 720 }} className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="text-center fw-bold bg-light">상품 수정</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            
            {/* 상품명 */}
            <Form.Group className="mb-3">
              <Form.Label>상품명</Form.Label>
              <Form.Control value={form.name} onChange={(event) => handleChangeField("name", event.target.value)} />
            </Form.Group>

            {/* 카테고리/ 브랜드 */}
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>카테고리</Form.Label>
                <Form.Select value={form.category} onChange={(event) => handleChangeField("category", event.target.value)}>
                  <option value="">선택</option>
                  {FILTER_OPTIONS.category
                    .filter((c) => c.label !== "전체")
                    .map((c) => <option key={c.value} value={c.value}>{prettyLabel(c.label)}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>브랜드</Form.Label>
                <Form.Select value={form.brand} onChange={(event) => handleChangeField("brand", event.target.value)}>
                  <option value="">선택</option>
                  {FILTER_OPTIONS.brand
                    .filter((b) => b.label !== "전체")
                    .map((b) => <option key={b.value} value={b.value}>{prettyLabel(b.label)}</option>)}
                </Form.Select>
              </Col>
            </Row>

            {/* 상세 설명 */}
            <Form.Group className="mt-3">
              <Form.Label>상세설명</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.description} onChange={(event) => handleChangeField("description", event.target.value)} />
            </Form.Group>

            {/* 가격 / 총 보유 수량 */}
            <Row className="mt-3 g-3">
              <Col md={6}>
                <Form.Label>가격</Form.Label>
                <Form.Control type="text" placeholder="예) 329000" value={form.price} onChange={(event) => handleChangeField("price", event.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>총 보유 수량</Form.Label>
                <Form.Control type="text" placeholder="예) 120" value={form.totalStock} onChange={(event) => handleChangeField("totalStock", event.target.value)} />
              </Col>
            </Row>

             {/* 이미지 영역 (기존 + 새 이미지) */}       
            <Form.Group className="mt-3">
              <Form.Label>상품 이미지</Form.Label>

               {/* 기존 이미지 목록 */}     
              {existingImages.length > 0 && (
                <Row className="g-2 mb-2">
                  {existingImages.map((url, i) => (
                    <Col key={i} xs={6} md={3}>
                      <Card className="border-0 shadow-sm position-relative">
                        <Card.Img src={url} style={{ height: 120, objectFit: "cover" }} />
                        <Button
                          variant="light" size="sm"
                          className="position-absolute top-0 end-0 m-1 rounded-circle"
                          onClick={() => handleRemoveExistingImage(url)}
                        >✕</Button>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}

              {/* 새로 업로드할 이미지 선택 */}
              <Form.Control type="file" multiple accept="image/*" ref={fileInputRef} onChange={handlePickFiles} />


              {/* 새로 업로드할 이미지 미리보기 */}
              {previewUrls.length > 0 && (
                <Row className="g-2 mt-2">
                  {previewUrls.map((p, i) => (
                    <Col key={i} xs={6} md={3}>
                      <Card className="border-0 shadow-sm position-relative">
                        <Card.Img src={p} style={{ height: 120, objectFit: "cover" }} />
                        <Button
                          variant="light" size="sm"
                          className="position-absolute top-0 end-0 m-1 rounded-circle"
                          onClick={() => handleRemoveNewImageAt(i)}
                        >✕</Button>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Form.Group>

              {/* 버튼들 */}
            <div className="d-flex justify-content-center gap-2 mt-3">
              <Button type="submit" variant="outline-primary" disabled={saving || deleting}>수정</Button>
              <Button variant="outline-danger" disabled={saving || deleting} onClick={handleDelete}>삭제</Button>
              <Button variant="outline-info" onClick={handleOpenLogs}>수정/삭제 내역</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* 수정/삭제 내역 모달 */}
      <Modal show={showLogs} onHide={() => setShowLogs(false)} centered>
        <Modal.Header closeButton><Modal.Title>수정/삭제 내역</Modal.Title></Modal.Header>
        <Modal.Body className="py-3">
          {logs.length ? (
            <ul className="list-unstyled mb-0">
              {logs.map((log, i) => (
                <li key={i} className="mb-2">
                  <div className="fw-semibold">{log.productName}</div>
                  <small className="text-muted">
                    {new Date(log.createdAt).toLocaleString("ko-KR")} · {log.event}
                  </small>
                </li>
              ))}
            </ul>
          ) : <div className="text-muted text-center">내역이 없습니다.</div>}
        </Modal.Body>
      </Modal>
    </Container>
  );
}