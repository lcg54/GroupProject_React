import { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";

export default function App() {

  const products = [
    {
      id: 1,
      company: '삼성전자',
      name: 'Galaxy Book Pro',
      price: 1200000,
      imageAlt: '삼성전자 Galaxy Book Pro 제품 사진',
      rentalPeriod: 1,
      rentalOptions: [
        { value: 1, label: '1년 대여' },
        { value: 2, label: '2년 대여' },
        { value: 3, label: '3년 대여' },
      ],
      selected: false,
      hasReview: true,
    },
    {
      id: 2,
      company: 'LG전자',
      name: 'Gram 16',
      price: 1500000,
      imageAlt: 'LG전자 Gram 16 제품 사진',
      rentalPeriod: 1,
      rentalOptions: [
        { value: 1, label: '1년 대여' },
        { value: 2, label: '2년 대여' },
        { value: 3, label: '3년 대여' },
      ],
      selected: false,
      hasReview: false,
    },
  ];

  const [selectedProduct, setSelectedProduct] = useState('');
  const handleChange = (event) => {
    setSelectedProduct(event.target.value);
  }

  return (
    <Container>
      <h2>리뷰 작성</h2>
      <Form.Group>
        <Form.Label>구매한 제품 선택</Form.Label>
        <Form.Control as="select" value={selectedProduct} onChange={handleChange}>
          <option value="">제품을 선택하세요</option>
          {products
            .filter((product) => !product.hasReview)
            .map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>평점</Form.Label>
        <Form.Control as="select" name="rating">
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
        <Form.Control type="text"></Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>문의 내용</Form.Label>
        <Form.Control placeholder="내용 작성" as="textarea" rows={9} maxLength={4000}></Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>리뷰 사진</Form.Label>
        <Form.Control type="file" ></Form.Control>
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-3">
        제출
      </Button>
    </Container >
  );
}