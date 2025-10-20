import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/config';
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col } from 'react-bootstrap';



function App({ }) {

    const [title, setTitle] = useState('');
    const [reason, setReason] = useState('');
    const [content, setContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);


    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            title,
            reason,
            content,
            isPrivate,
        };
    };

    return (
        <Container className="mb-3">
            <Form.Group as={Row}>
                <Form.Label column sm={1}>문의 제목</Form.Label>
                <Col sm={10}><Form.Control placeholder="제목 작성" value={title} onChange={(e) => setTitle(e.target.value)}></Form.Control></Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column sm={1}>문의 사유</Form.Label>
                <Col sm={10}>
                    <Form.Select value={reason} onChange={(e) => setReason(e.target.value)}>
                        <option value="">선택</option>
                        <option value="배송">배송</option>
                        <option value="상품">상품</option>
                        <option value="기타">기타</option>
                    </Form.Select>
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column sm={1}>문의 내용</Form.Label>
                <Col sm={10}><Form.Control placeholder="제목 작성" rows={10} as="textarea" maxLength={4000}></Form.Control></Col>
            </Form.Group>
            <Form.Group className="d-flex justify-content-end">
                <Form.Check type="checkbox" label="비공개 체크박스" />
            </Form.Group>
        </Container>
    );
}

export default App;