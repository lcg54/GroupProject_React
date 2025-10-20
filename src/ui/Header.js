<<<<<<< HEAD
=======
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button } from 'react-bootstrap';
import './Header.css';

>>>>>>> develop
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();

  const lastScrollY = useRef(window.scrollY);
  const menuOpenRef = useRef(menuOpen);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
    if (menuOpen) {
      setIsHidden(true); // 메뉴 열릴 때 무조건 숨김
    } else {
      setIsHidden(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (menuOpenRef.current) return;

      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // 스크롤 내림: 헤더 숨김
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        // 스크롤 올림: 헤더 보임
        setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;

      // 스크롤 멈춤 감지: 300ms 후 헤더 보임
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsHidden(false);
      }, 300);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  const headerClass = `header ${isHidden ? 'header-hidden' : 'header-visible'}`;

  return (
<<<<<<< HEAD
    <>header</>
=======
    <>
      <Navbar className={headerClass}>
        <Button
          variant="outline-secondary"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-controls="side-menu"
          aria-expanded={menuOpen}
          className="me-3"
        >
          <img src="/path-to-hamburger-icon.svg" alt="Menu" />
        </Button>

        <Nav className="ms-auto d-none d-lg-flex">
          <Nav.Link href="/login">login</Nav.Link>
          <Nav.Link href="/signup">signup</Nav.Link>
        </Nav>
      </Navbar>

      {/* 사이드 메뉴 및 오버레이는 그대로 유지 */}
      <div
        id="side-menu"
        style={{
          position: 'fixed',
          top: 0,
          left: menuOpen ? 0 : '-250px',
          height: '100vh',
          width: '250px',
          backgroundColor: '#f8f9fa',
          boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
          padding: '2rem 1rem',
          transition: 'left 0.3s ease',
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <Button variant="light" onClick={() => { navigate('/'); setMenuOpen(false); }} style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          홈페이지 가기
        </Button>
        <Button variant="light" onClick={() => { navigate('/product/list'); setMenuOpen(false); }}>
          상품목록
        </Button>
        <Button variant="light" onClick={() => { navigate('/inquiry/list'); setMenuOpen(false); }}>
          문의게시판
        </Button>
        <Button variant="light" onClick={() => { navigate('/review'); setMenuOpen(false); }}>
          후기게시판
        </Button>
        <Button variant="light" onClick={() => { navigate('/mypage'); setMenuOpen(false); }}>
          마이페이지
        </Button>
        <Button variant="light" onClick={() => { navigate('/cart'); setMenuOpen(false); }}>
          장바구니
        </Button>
        <Button variant="light" onClick={() => { navigate('/admin/product/register'); setMenuOpen(false); }}>
          상품등록
        </Button>

        <hr />

        <Button variant="light" onClick={() => { navigate('/login'); setMenuOpen(false); }}>
          로그인
        </Button>
        <Button variant="light" onClick={() => { navigate('/signup'); setMenuOpen(false); }}>
          회원가입
        </Button>
      </div>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '100vw',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 1040,
          }}
        />
      )}
    </>
>>>>>>> develop
  );
}
