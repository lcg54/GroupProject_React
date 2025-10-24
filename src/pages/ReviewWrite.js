import { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";

export default function App() {

  const [purchases, setPurchases] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [rating, setRating] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    const mockPurchases = [
      { id: 1, name: "Galaxy Book Pro" },
      { id: 2, name: "LG Gram 16" }
    ];
    setPurchases(mockPurchases);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!selectedProduct || !rating || !content) {
      alert("모든 항목 작성")
      return;
    }

    const formData = new FormData();
    formData.append("productId", selectedProduct);
    formData.append("rating", rating);
    formData.append("content", content);
    if (file) {
      formData.append("file", file);
    }

    console.log("폼 데이터 전송", formData);
    alert("리뷰 제출");

  }

  return (
    <Container>
      <h2>리뷰 작성</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>구매한 제품 선택</Form.Label>
          <Form.Control as="select" value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)}>
            <option value="">제품을 선택하세요</option>
            {purchases.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>평점</Form.Label>
          <Form.Control as="select" name="rating" value={rating} onChange={(event) => setRating(event.target.value)}>
            <option value="">선택하세요</option>
            <option value="1">★☆☆☆☆</option>
            <option value="2">★★☆☆☆</option>
            <option value="3">★★★☆☆</option>
            <option value="4">★★★★☆</option>
            <option value="5">★★★★★</option>
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>리뷰 내용</Form.Label>
          <Form.Control type="text" name="content" placeholder="내용 작성" as="textarea" rows={9} maxLength={4000}
            value={content} onChange={(event) => setContent(event.target.value)}></Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>리뷰 사진</Form.Label>
          <Form.Control type="file" onChange={(event) => setFile(event.target.files[0])} ></Form.Control>
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          제출
        </Button>
      </Form>
    </Container>
  );
}