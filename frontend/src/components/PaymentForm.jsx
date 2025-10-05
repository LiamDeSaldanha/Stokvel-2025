import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { stokvelAPI } from '../services/api';
import './PaymentForm.css';

const PaymentForm = () => {
  const navigate = useNavigate();
  const { stokvelId } = useParams(); // Optional: if coming from a specific stokvel
  
  const [formData, setFormData] = useState({
    userid: '',
    stokvel_id: stokvelId || '',
    stokvel_name: '',
    amount: '',
    payment_status: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Data for dropdowns
  const [users, setUsers] = useState([]);
  const [stokvels, setStokvels] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      setLoadingData(true);
      const [usersResponse, stokvelsResponse] = await Promise.all([
        stokvelAPI.getAllUsers(),
        stokvelAPI.getAllStokvels()
      ]);
      
      setUsers(usersResponse.data);
      setStokvels(stokvelsResponse.data);
      
      // If stokvelId is provided, auto-select the stokvel
      if (stokvelId) {
        const selectedStokvel = stokvelsResponse.data.find(s => s.id === parseInt(stokvelId));
        if (selectedStokvel) {
          setFormData(prev => ({
            ...prev,
            stokvel_id: selectedStokvel.id,
            stokvel_name: selectedStokvel.name
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error loading form data. Please refresh the page.');
      setMessageType('error');
    } finally {
      setLoadingData(false);
    }
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'userid':
        if (!value) {
          newErrors.userid = 'Please select a user.';
        } else {
          delete newErrors.userid;
        }
        break;
        
      case 'stokvel_id':
        if (!value) {
          newErrors.stokvel_id = 'Please select a stokvel.';
        } else {
          delete newErrors.stokvel_id;
        }
        break;
        
      case 'amount':
        if (!value) {
          newErrors.amount = 'Amount is required.';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          newErrors.amount = 'Please enter a valid amount greater than 0.';
        } else if (parseFloat(value) > 1000000) {
          newErrors.amount = 'Amount cannot exceed R1,000,000.';
        } else {
          delete newErrors.amount;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle stokvel selection
    if (name === 'stokvel_id') {
      const selectedStokvel = stokvels.find(s => s.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        stokvel_id: value,
        stokvel_name: selectedStokvel ? selectedStokvel.name : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Mark all fields as touched for validation
    const requiredFields = ['userid', 'stokvel_id', 'amount'];
    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    // Validate all fields
    let isValid = true;
    requiredFields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      // Prepare payment data
      const paymentData = {
        userid: parseInt(formData.userid),
        stokvel_id: parseInt(formData.stokvel_id),
        stokvel_name: formData.stokvel_name,
        amount: parseFloat(formData.amount),
        payment_status: 0 // Default to pending
      };

      await stokvelAPI.createPayment(paymentData);
      
      setMessage('Payment submitted successfully!');
      setMessageType('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/stokvels');
      }, 2000);
      
    } catch (error) {
      console.error('Payment submission error:', error);
      setMessage(error.response?.data?.detail || 'Failed to submit payment. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = !Object.keys(errors).length && 
    formData.userid && 
    formData.stokvel_id && 
    formData.amount;

  if (loadingData) {
    return (
      <div className="payment-form-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-form-container">
      <div className="payment-form-card">
        <header className="form-header">
          <h1>Make Payment</h1>
          <p>Submit a payment to your stokvel</p>
        </header>

        <form onSubmit={handleSubmit} className="payment-form">
          {/* User Selection */}
          <div className="form-field">
            <label htmlFor="userid">Select User</label>
            <select
              id="userid"
              name="userid"
              value={formData.userid}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={touched.userid && errors.userid ? 'error' : ''}
            >
              <option value="">Choose user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.surname} ({user.email || user.id_number})
                </option>
              ))}
            </select>
            {touched.userid && errors.userid && (
              <span className="error-message">{errors.userid}</span>
            )}
          </div>

          {/* Stokvel Selection */}
          <div className="form-field">
            <label htmlFor="stokvel_id">Select Stokvel</label>
            <select
              id="stokvel_id"
              name="stokvel_id"
              value={formData.stokvel_id}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={touched.stokvel_id && errors.stokvel_id ? 'error' : ''}
              disabled={!!stokvelId} // Disable if coming from specific stokvel
            >
              <option value="">Choose stokvel...</option>
              {stokvels.map(stokvel => (
                <option key={stokvel.id} value={stokvel.id}>
                  {stokvel.name} (R{stokvel.monthly_contribution}/month)
                </option>
              ))}
            </select>
            {touched.stokvel_id && errors.stokvel_id && (
              <span className="error-message">{errors.stokvel_id}</span>
            )}
          </div>

          {/* Amount */}
          <div className="form-field">
            <label htmlFor="amount">Payment Amount (R)</label>
            <input
              id="amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={touched.amount && errors.amount ? 'error' : ''}
            />
            {touched.amount && errors.amount && (
              <span className="error-message">{errors.amount}</span>
            )}
          </div>

          {/* Payment Summary */}
          {formData.stokvel_name && formData.amount && (
            <div className="payment-summary">
              <h3>Payment Summary</h3>
              <div className="summary-row">
                <span>Stokvel:</span>
                <span>{formData.stokvel_name}</span>
              </div>
              <div className="summary-row">
                <span>Amount:</span>
                <span>R{parseFloat(formData.amount || 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                'Submit Payment'
              )}
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;