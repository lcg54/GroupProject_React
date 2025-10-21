import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/url';
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, Button } from 'react-bootstrap';


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
            <h2>문의사항</h2>
            <div>
                <Form>
                    <Form.Group as={Row} >
                        <Form.Label column sm={1}>문의 제목</Form.Label>
                        <Col sm={9}><Form.Control placeholder="제목 작성" value={title} maxLength={35} onChange={(e) => setTitle(e.target.value)}></Form.Control></Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm={1}>문의 사유</Form.Label>
                        <Col sm={9}>
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
                        <Col sm={9}><Form.Control placeholder="내용 작성" value={content} rows={10} as="textarea" maxLength={4000}></Form.Control></Col>
                    </Form.Group>
                    <Form.Group className="d-flex justify-content-end" >
                        <Form.Check type="checkbox" label="비공개 체크박스" value={isPrivate} style={{ position: 'relative', right: 225, flexShrink: 0 }} />
                    </Form.Group>
                    <Button type="submit">제출</Button>
                </Form>
            </div>

        </Container>
    );
}

export default App;