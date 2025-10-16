import './App.css';
import Header from './ui/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './ui/Footer';
import { useEffect, useState } from 'react';

export default function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loginUser = localStorage.getItem('user');
    setUser(JSON.parse(loginUser));
  }, []);

  return (
    <>
      <Header />
      <AppRoutes user={user} />
      <Footer />
    </>
  );
}