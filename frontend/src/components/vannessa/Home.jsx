import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const goRegister = () => {
    navigate('/register');
  };

  const goLogin = () => {
    navigate('/login');
  };

  return (
    <div className="home">
      <div className="hero">
        <h1 className="title">Welcome to Stokvel</h1>
        <p className="subtitle">Simple community savings. Create an account or sign in.</p>

        <div className="actions">
          <button className="btn primary" onClick={goRegister}>
            Register
          </button>
          <button className="btn ghost" onClick={goLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;