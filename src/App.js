import './App.css';
import Header from './ui/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './ui/Footer';
import { useState } from 'react';

export default function App() {
  const [user, setUser] = useState(null); // 로그인 로그아웃

  return (
    <>
      <Header user={user} />
      <AppRoutes user={user} />
      <Footer />
    </>
  );
}