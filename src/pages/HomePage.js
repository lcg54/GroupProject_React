import DoubleCircle from "./home/DoubleCircle";
import { Container, Row, Col, Image, Card } from 'react-bootstrap';

const HeroSection = () => {
  const products = [
    { id: 1, name: '냉장고', image: 'https://via.placeholder.com/140x100?text=제품+1' },
    { id: 2, name: '세탁기', image: 'https://via.placeholder.com/140x100?text=제품+2' },
    { id: 3, name: '건조기', image: 'https://via.placeholder.com/140x100?text=제품+3' },
    { id: 4, name: '에어컨', image: 'https://via.placeholder.com/140x100?text=제품+4' },
    { id: 5, name: '티비', image: 'https://via.placeholder.com/140x100?text=제품+5' },
    { id: 6, name: '오븐', image: 'https://via.placeholder.com/140x100?text=제품+6' },
    { id: 7, name: '전자레인지', image: 'https://via.placeholder.com/140x100?text=제품+7' },
    { id: 8, name: '기타가전', image: 'https://via.placeholder.com/140x100?text=제품+8' },
  ];
  return (
<<<<<<< HEAD
    <Container className="mt-4" style={{ maxWidth: "750px" }}>
      {/* 테스트용 네비게이션 버튼, 나중에 지울게요 */}
      <button onClick={() => navigate(`/product/list`)}>상품목록</button><br />
      <button onClick={() => navigate(`/inquiry/list`)}>문의게시판</button><br />
      <button onClick={() => navigate(`/review`)}>후기게시판</button><br />
      <button onClick={() => navigate(`/member/mypage`)}>마이페이지</button><br />
      <button onClick={() => navigate(`/member/cart`)}>장바구니</button><br />
      <button onClick={() => navigate(`/admin/product/register`)}>관리자</button><br />
=======
    <Container
      style={{ maxWidth: '900px', backgroundColor: '#FFFDF2', padding: '10rem 2rem', borderRadius: '10px' }}
      className="my-5"
    >
      <Row className="align-items-start">
        <Col md={6} className="d-flex flex-column align-items-start">

          <div style={{ marginBottom: '1.5rem' }}>
            <DoubleCircle />
          </div>

          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            Renting quality<br />of life
          </h1>
          <p>당신의 삶의 질을 높히기 위해<br />저희는 편안함을 대여해 드립니다.</p>
        </Col>
        <Col md={6} className="text-center">
          <Image
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"
            fluid
            rounded
            style={{ height: '900px', marginTop: '0rem', maxHeight: '650px', objectFit: 'cover', width: '100%' }}
          />
        </Col>
      </Row>

      {/* 사진이 작고 귀엽게 1행 카드 */}
      <Row
        className="justify-content-center mt-5"
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          paddingBottom: '1rem',
          userSelect: 'none',
        }}
      >
        {products.map((product) => (
          <Card
            key={product.id}
            style={{
              width: '80px',
              minWidth: '80px',
              height: '100px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '0.25rem',
              boxShadow: 'none',
              border: 'none',
              borderRadius: '10px',
              flexShrink: 0,
              backgroundColor: 'transparent',
              textAlign: 'center',
              fontSize: '0.75rem',
              cursor: 'default',
              // onClick={() => navigate(`/product/${product.id}`)}
            }}
            title={product.name}
          >
            <Image
              src={product.imgSrc}
              alt={product.name}
              roundedCircle
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'cover',
                marginBottom: '0.25rem',
                userSelect: 'none',
              }}
            />
            <div
              style={{
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
              }}
            >
              {product.name}
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                color: '#888',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
              }}
            >
              {product.category}
            </div>
          </Card>
        ))}
      </Row>
>>>>>>> develop
    </Container>
  );
};

export default HeroSection;