import './App.css';
import Header from './ui/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './ui/Footer';
import { useState } from 'react';

export default function App() {
  const ADMIN = {
    id: 1,
    username: "admin01",
    name: "관리자",
    email: "admin@example.com",
    password: "admin1234",
    phone: "010-1111-2222",
    address: "서울시 강남구 테헤란로 1",
    profileImage: "admin_profile.jpg",
    role: "ADMIN",
    regDate: "2025-10-18"
  };
  const USER = {
      id: 2,
      username: "user01",
      name: "홍길동",
      email: "user@example.com",
      password: "user1234",
      phone: "010-3333-4444",
      address: "서울시 마포구 홍익로 10",
      profileImage: "user_profile.jpg",
      role: "USER",
      regDate: "2025-10-18"
  }

  return (
    <>
      <Header />
      <AppRoutes user={USER} />
      <Footer />
    </>
  );
}