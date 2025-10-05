import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    idOrPassportNumber: '',
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
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required.';
        } else if (value.length > 100) {
          newErrors.name = 'Max 100 characters.';
        } else {
          delete newErrors.name;
        }
        break;

      case 'surname':
        if (!value.trim()) {
          newErrors.surname = 'Surname is required.';
        } else if (value.length > 100) {
          newErrors.surname = 'Max 100 characters.';
        } else {
          delete newErrors.surname;
        }
        break;

      case 'idOrPassportNumber':
        if (!value.trim()) {
          newErrors.idOrPassportNumber = 'This field is required.';
        } else if (value.length > 32) {
          newErrors.idOrPassportNumber = 'Max 32 characters.';
        } else {
          delete newErrors.idOrPassportNumber;
        }
        break;

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
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

    // Mark all required fields as touched for validation
    const requiredFields = ['name', 'surname', 'idOrPassportNumber', 'password'];
    const newTouched = { ...touched };
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    // Validate all fields
    let isValid = true;
    Object.keys(formData).forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    // Check required fields
    const hasRequiredFields = requiredFields.every(field => formData[field].trim());
    
    if (!isValid || !hasRequiredFields) {
      setLoading(false);
      return;
    }

    try {
      // TODO: Implement actual registration API call
      console.log('Registration attempt:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // On success, navigate to login or dashboard
      navigate('/login');
      setServerMsg('Registration successful! Please login.');
    } catch (error) {
      setServerMsg('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid = Object.keys(errors).length > 0 || 
    !formData.name.trim() || 
    !formData.surname.trim() || 
    !formData.idOrPassportNumber.trim() || 
    !formData.password;

  return (
    <div className="page">
      <div className="card">
        <header className="card__header">
          <h1 className="title">Create Stokvel Account</h1>
          <p className="subtitle">Fill in your details to get started</p>
        </header>

        <form className="form" onSubmit={submit} noValidate>
          {/* Name */}
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={touched.name && errors.name ? 'is-invalid' : ''}
              placeholder="e.g. Lwazi"
            />
            {touched.name && errors.name && (
              <div className="error">
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Surname */}
          <div className="field">
            <label htmlFor="surname">Surname</label>
            <input
              id="surname"
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={touched.surname && errors.surname ? 'is-invalid' : ''}
              placeholder="e.g. Mamelodi"
            />
            {touched.surname && errors.surname && (
              <div className="error">
                <span>{errors.surname}</span>
              </div>
            )}
          </div>

          {/* ID / Passport */}
          <div className="field">
            <label htmlFor="idp">ID / Passport Number</label>
            <input
              id="idp"
              type="text"
              name="idOrPassportNumber"
              value={formData.idOrPassportNumber}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={touched.idOrPassportNumber && errors.idOrPassportNumber ? 'is-invalid' : ''}
              placeholder="e.g. 9001015800087 or A1234567"
            />
            {touched.idOrPassportNumber && errors.idOrPassportNumber && (
              <div className="error">
                <span>{errors.idOrPassportNumber}</span>
              </div>
            )}
          </div>

          {/* Email (optional) */}
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
              placeholder="e.g. lwazi@example.com"
            />
            {touched.email && errors.email && (
              <div className="error">
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password */}
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
              placeholder="Minimum 8 characters"
            />
            {touched.password && errors.password && (
              <div className="error">
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="actions">
            <button type="submit" className="btn" disabled={loading || isFormInvalid}>
              {loading && <span className="spinner"></span>}
              <span>{loading ? 'Processing…' : 'Register'}</span>
            </button>
          </div>

          {/* Server message */}
          {serverMsg && <p className="server-msg">{serverMsg}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;