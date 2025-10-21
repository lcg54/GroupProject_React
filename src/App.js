import './App.css';
import Header from './ui/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './ui/Footer';
import AppWrapper from "./routes/AppWrapper";
import { useState } from 'react';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <AppWrapper>
      <Header />
      <AppRoutes user={user} setUser={setUser} />
      <Footer />
    </AppWrapper>
  );
}