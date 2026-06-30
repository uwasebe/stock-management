import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Product from './components/Product';
import ProductIn from './components/ProductIn';
import ProductOut from './components/ProductOut';
import Report from './components/Report'; // <-- Injejwe neza nk'uko iri ku ifoto

function App() {
  // Genzura niba umucuruzi afite urufunguzo (Token) mu bubiko bwa browser
  const isAuthenticated = () => !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Inzira rusange (Public Routes) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Inzira zirinzwe (Protected Routes) - Inzirwamo gusa niba warakoze Login */}
        <Route path="/dashboard" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/products" element={isAuthenticated() ? <Product /> : <Navigate to="/login" />} />
        <Route path="/product-in" element={isAuthenticated() ? <ProductIn /> : <Navigate to="/login" />} />
        <Route path="/product-out" element={isAuthenticated() ? <ProductOut /> : <Navigate to="/login" />} />
        <Route path="/reports" element={isAuthenticated() ? <Report /> : <Navigate to="/login" />} />

        {/* Niba umuntu anditse inzira itabaho, ahite asubizwa kuri Login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;