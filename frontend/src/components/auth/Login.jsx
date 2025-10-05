import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Enter a valid email.';
        if (value.length > 200) return 'Max 200 characters.';
        return null;
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 8) return 'At least 8 characters.';
        if (value.length > 100) return 'Max 100 characters.';
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field on change if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    return Object.keys(formData).every(field => {
      const error = validateField(field, formData[field]);
      return !error;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      newErrors[field] = validateField(field, formData[field]);
    });
    setErrors(newErrors);

    if (!isFormValid()) return;

    setLoading(true);
    setServerMsg(null);

    try {
      // For now, simulate login since we don't have auth endpoints
      // This can be connected to actual login API later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setServerMsg(`Welcome back!`);
      // In a real app, you'd handle authentication state here
    } catch (error) {
      setServerMsg('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <header className="card__header">
          <h1 className="title">Login</h1>
          <p className="subtitle">Use your email and password</p>
        </header>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.email && errors.email ? 'is-invalid' : ''}
              placeholder="you@example.com"
            />
            <div className="error">
              {touched.email && errors.email && <span>{errors.email}</span>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="pwd">Password</label>
            <input
              id="pwd"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.password && errors.password ? 'is-invalid' : ''}
              placeholder="Your password"
            />
            <div className="error">
              {touched.password && errors.password && <span>{errors.password}</span>}
            </div>
          </div>

          <div className="actions">
            <button type="submit" className="btn" disabled={loading || !isFormValid()}>
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