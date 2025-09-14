// Redirection vers la nouvelle page de connexion POS sécurisée
import { Navigate } from 'react-router-dom';

export default function POSLoginPage() {
  return <Navigate to="/pos/login-secure" replace />;
}