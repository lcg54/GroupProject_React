import { Nav } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";

export default function Header() {

  const navigate = useNavigate();


  return (
    <Nav.Link onClick={() => navigate(`/member/signup`)}>xx</Nav.Link>
  )
}