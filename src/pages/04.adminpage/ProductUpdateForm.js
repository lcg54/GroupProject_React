import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Container, Form, Button, Card, Row, Col, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { FILTER_OPTIONS } from "../02.product/ProductListFilter";
import { prettyLabel } from "../../util/replace"

export default function ProductUpdateForm({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const warned = useRef(false);

  const [form, setForm] = useState({ name: "", category: "", brand: "", description: "", price: "", totalStock: "" });
  const [existing, setExisting] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef(null);

  const validId = /^\d+$/.test(id || "");

  useEffect(() => {
    const isBlocked = !(user && user.role && String(user.role).toUpperCase() === "ADMIN");
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

        let urls = [];
        if (Array.isArray(data.images) && data.images.length) {
          urls = data.images.map((fn) => (String(fn).startsWith("http") ? fn : `${API_BASE_URL}/images/${fn}`));
        } else if (data.mainImage) {
          urls = [data.mainImage.startsWith("http") ? data.mainImage : `${API_BASE_URL}/images/${data.mainImage}`];
        }
        setExisting(urls);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, id]);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onPickFiles = (e) => {
    const fs = Array.from(e.target.files || []);
    setFiles(fs);
    setPreviews(fs.map((f) => URL.createObjectURL(f)));
  };

  const removeExisting = (url) => setExisting((arr) => arr.filter((u) => u !== url));
  const removeNewAt = (i) => {
    setFiles((arr) => arr.filter((_, idx) => idx !== i));
    setPreviews((arr) => {
      const cp = [...arr];
      URL.revokeObjectURL(cp[i]);
      cp.splice(i, 1);
      return cp;
    });
  };

  const buildFD = () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("category", form.category);
    fd.append("brand", form.brand);
    if (form.description) fd.append("description", form.description);
    fd.append("price", form.price || "0");
    fd.append("totalStock", form.totalStock || "0");

    const keep = existing.map((url) => {
      const i = url.lastIndexOf("/images/");
      return i >= 0 ? url.substring(i + 8) : url;
    });
    fd.append("existingImages", JSON.stringify(keep));
    files.forEach((f) => fd.append("images", f));
    return fd;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.brand || form.price === "" || form.totalStock === "") {
      alert("필수 항목을 입력하세요.");
      return;
    }
    if (!window.confirm("수정할까요?")) return;

    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/product/${id}`, buildFD(), { withCredentials: true });
      alert("수정 완료");
      navigate("/product/list");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm("정말 삭제할까요?")) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/product/${id}`, { withCredentials: true });
      alert("삭제 완료");
      navigate("/product/list");
    } finally {
      setDeleting(false);
    }
  };

  const openLogs = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/product/logs/changes`, { withCredentials: true });
    setLogs(Array.isArray(data) ? data : []);
    setShowLogs(true);
  };

  
  if (loading || !user) return null;

  return (
    <Container style={{ maxWidth: 720 }} className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="text-center fw-bold bg-light">상품 수정</Card.Header>
        <Card.Body>
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>상품명</Form.Label>
              <Form.Control value={form.name} onChange={(e) => onChange("name", e.target.value)} />
            </Form.Group>

            <Row className="g-3">
              <Col md={6}>
                <Form.Label>카테고리</Form.Label>
                <Form.Select value={form.category} onChange={(e) => onChange("category", e.target.value)}>
                  <option value="">선택</option>
                  {FILTER_OPTIONS.category
                    .filter((c) => c.label !== "전체")
                    .map((c) => <option key={c.value} value={c.value}>{prettyLabel(c.label)}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>브랜드</Form.Label>
                <Form.Select value={form.brand} onChange={(e) => onChange("brand", e.target.value)}>
                  <option value="">선택</option>
                  {FILTER_OPTIONS.brand
                    .filter((b) => b.label !== "전체")
                    .map((b) => <option key={b.value} value={b.value}>{prettyLabel(b.label)}</option>)}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label>상세설명</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.description} onChange={(e) => onChange("description", e.target.value)} />
            </Form.Group>

            <Row className="mt-3 g-3">
              <Col md={6}>
                <Form.Label>가격</Form.Label>
                <Form.Control type="text" placeholder="예) 329000" value={form.price} onChange={(e) => onChange("price", e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>총 보유 수량</Form.Label>
                <Form.Control type="text" placeholder="예) 120" value={form.totalStock} onChange={(e) => onChange("totalStock", e.target.value)} />
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label>상품 이미지</Form.Label>

              {existing.length > 0 && (
                <Row className="g-2 mb-2">
                  {existing.map((url, i) => (
                    <Col key={i} xs={6} md={3}>
                      <Card className="border-0 shadow-sm position-relative">
                        <Card.Img src={url} style={{ height: 120, objectFit: "cover" }} />
                        <Button
                          variant="light" size="sm"
                          className="position-absolute top-0 end-0 m-1 rounded-circle"
                          onClick={() => removeExisting(url)}
                        >✕</Button>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}

              <Form.Control type="file" multiple accept="image/*" ref={fileRef} onChange={onPickFiles} />

              {previews.length > 0 && (
                <Row className="g-2 mt-2">
                  {previews.map((p, i) => (
                    <Col key={i} xs={6} md={3}>
                      <Card className="border-0 shadow-sm position-relative">
                        <Card.Img src={p} style={{ height: 120, objectFit: "cover" }} />
                        <Button
                          variant="light" size="sm"
                          className="position-absolute top-0 end-0 m-1 rounded-circle"
                          onClick={() => removeNewAt(i)}
                        >✕</Button>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Form.Group>

            <div className="d-flex justify-content-center gap-2 mt-3">
              <Button type="submit" variant="outline-primary" disabled={saving || deleting}>수정</Button>
              <Button variant="outline-danger" disabled={saving || deleting} onClick={onDelete}>삭제</Button>
              <Button variant="outline-info" onClick={openLogs}>수정/삭제 내역</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

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