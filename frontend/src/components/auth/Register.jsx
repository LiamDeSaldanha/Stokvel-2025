import React, { useState } from 'react';
import './Register.css';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    idOrPassportNumber: '',
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required.';
        if (value.length > 100) return 'Max 100 characters.';
        return null;
      case 'surname':
        if (!value.trim()) return 'Surname is required.';
        if (value.length > 100) return 'Max 100 characters.';
        return null;
      case 'idOrPassportNumber':
        if (!value.trim()) return 'This field is required.';
        if (value.length > 32) return 'Max 32 characters.';
        return null;
      case 'email':
        if (value && value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) return 'Enter a valid email.';
          if (value.length > 200) return 'Max 200 characters.';
        }
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
    const requiredFields = ['name', 'surname', 'idOrPassportNumber', 'password'];
    return requiredFields.every(field => {
      const error = validateField(field, formData[field]);
      return !error;
    }) && !validateField('email', formData.email);
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
      const dto = {
        name: formData.name,
        surname: formData.surname,
        id_number: formData.idOrPassportNumber,
        email: formData.email?.trim() || null,
        password: formData.password
      };

      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto)
      });

      if (response.ok) {
        const result = await response.json();
        setServerMsg(`Registered: ${result.name} ${result.surname}`);
        setFormData({
          name: '',
          surname: '',
          idOrPassportNumber: '',
          email: '',
          password: ''
        });
        setTouched({});
        setErrors({});
      } else {
        const errorData = await response.json();
        setServerMsg(errorData.message || 'Registration failed');
      }
    } catch (error) {
      setServerMsg('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <header className="card__header">
          <h1 className="title">Create Stockvel Account</h1>
          <p className="subtitle">Fill in your details to get started</p>
        </header>

        <form className="form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.name && errors.name ? 'is-invalid' : ''}
              placeholder="e.g. Lwazi"
            />
            <div className="error">
              {touched.name && errors.name && <span>{errors.name}</span>}
            </div>
          </div>

          {/* Surname */}
          <div className="field">
            <label htmlFor="surname">Surname</label>
            <input
              id="surname"
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.surname && errors.surname ? 'is-invalid' : ''}
              placeholder="e.g. Mamelodi"
            />
            <div className="error">
              {touched.surname && errors.surname && <span>{errors.surname}</span>}
            </div>
          </div>

          {/* ID / Passport */}
          <div className="field">
            <label htmlFor="idp">ID / Passport Number</label>
            <input
              id="idp"
              type="text"
              name="idOrPassportNumber"
              value={formData.idOrPassportNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.idOrPassportNumber && errors.idOrPassportNumber ? 'is-invalid' : ''}
              placeholder="e.g. 9001015800087 or A1234567"
            />
            <div className="error">
              {touched.idOrPassportNumber && errors.idOrPassportNumber && <span>{errors.idOrPassportNumber}</span>}
            </div>
          </div>

          {/* Email (optional) */}
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
              placeholder="e.g. lwazi@example.com"
            />
            <div className="error">
              {touched.email && errors.email && <span>{errors.email}</span>}
            </div>
          </div>

          {/* Password */}
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
              placeholder="Minimum 8 characters"
            />
            <div className="error">
              {touched.password && errors.password && <span>{errors.password}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="actions">
            <button type="submit" className="btn" disabled={loading || !isFormValid()}>
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