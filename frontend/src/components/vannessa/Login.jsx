import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Enter a valid email.';
        } else if (value.length > 200) {
          newErrors.email = 'Max 200 characters.';
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required.';
        } else if (value.length < 8) {
          newErrors.password = 'At least 8 characters.';
        } else if (value.length > 100) {
          newErrors.password = 'Max 100 characters.';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerMsg('');

    // Mark all fields as touched for validation
    setTouched({ email: true, password: true });
    
    // Validate all fields
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);
    
    if (!isEmailValid || !isPasswordValid) {
      setLoading(false);
      return;
    }

    try {
      // TODO: Implement actual login API call
      console.log('Login attempt:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // On success, navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      setServerMsg('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid = Object.keys(errors).length > 0 || !formData.email || !formData.password;

  return (
    <div className="page">
      <div className="card">
        <header className="card__header">
          <h1 className="title">Login</h1>
          <p className="subtitle">Use your email and password</p>
        </header>

        <form className="form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={touched.email && errors.email ? 'is-invalid' : ''}
              placeholder="you@example.com"
            />
            {touched.email && errors.email && (
              <div className="error">
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="pwd">Password</label>
            <input
              id="pwd"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={touched.password && errors.password ? 'is-invalid' : ''}
              placeholder="Your password"
            />
            {touched.password && errors.password && (
              <div className="error">
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          <div className="actions">
            <button type="submit" className="btn" disabled={loading || isFormInvalid}>
              {loading && <span className="spinner"></span>}
              <span>{loading ? 'Checking…' : 'Login'}</span>
            </button>
          </div>

          {serverMsg && <p className="server-msg">{serverMsg}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;