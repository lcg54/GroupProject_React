import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useOutletContext } from "react-router-dom";

export default function MyInfoPage() {
  const { user } = useOutletContext();

  useEffect(() => {
    if (!user) return;
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {

  }

  return (
    <Container>

    </Container>
  );
}