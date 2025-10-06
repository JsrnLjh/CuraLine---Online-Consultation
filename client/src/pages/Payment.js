import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Smartphone, Wallet, CheckCircle, ArrowLeft } from 'lucide-react';
import './Payment.css';

function Payment() {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    fetchConsultation();
  }, [consultationId]);

  const fetchConsultation = async () => {
    try {
      const response = await axios.get(`/api/consultations/${consultationId}`);
      setConsultation(response.data);
      setLoading(false);
    } catch (err) {
      alert('Failed to load consultation details');
      navigate('/consultations');
    }
  };

  const handleCardChange = (e) => {
    let value = e.target.value;
    
    if (e.target.name === 'cardNumber') {
      // Format card number with spaces
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) value = value.substr(0, 19);
    } else if (e.target.name === 'expiryDate') {
      // Format expiry date MM/YY
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substr(0, 2) + '/' + value.substr(2, 2);
      }
      if (value.length > 5) value = value.substr(0, 5);
    } else if (e.target.name === 'cvv') {
      value = value.replace(/\D/g, '').substr(0, 3);
    }
    
    setCardDetails({
      ...cardDetails,
      [e.target.name]: value
    });
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    if (selectedMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
        alert('Please fill in all card details');
        return;
      }
    }

    setProcessing(true);

    try {
      await axios.post('/api/payments', {
        consultationId: consultation.id,
        amount: consultation.consultationFee,
        method: selectedMethod,
        cardDetails: selectedMethod === 'card' ? cardDetails : null
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/consultations');
      }, 3000);
    } catch (err) {
      alert('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="payment-success card">
            <CheckCircle size={80} color="#10b981" />
            <h2>Payment Successful!</h2>
            <p>Your payment of ₱{consultation.consultationFee} has been processed</p>
            <div className="success-details">
              <p><strong>Consultation with:</strong> {consultation.doctorName}</p>
              <p><strong>Date:</strong> {new Date(consultation.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {consultation.time}</p>
            </div>
            <p className="redirect-message">Redirecting to your consultations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <button onClick={() => navigate('/consultations')} className="back-button">
          <ArrowLeft size={20} />
          Back to Consultations
        </button>

        <div className="payment-container">
          <div className="payment-summary card">
            <h2>Payment Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Doctor:</span>
                <strong>{consultation.doctorName}</strong>
              </div>
              <div className="summary-row">
                <span>Specialty:</span>
                <strong>{consultation.doctorSpecialty}</strong>
              </div>
              <div className="summary-row">
                <span>Date:</span>
                <strong>{new Date(consultation.date).toLocaleDateString()}</strong>
              </div>
              <div className="summary-row">
                <span>Time:</span>
                <strong>{consultation.time}</strong>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <strong className="amount">₱{consultation.consultationFee}</strong>
              </div>
            </div>
          </div>

          <div className="payment-methods card">
            <h2>Select Payment Method</h2>
            
            <div className="payment-options">
              <div 
                className={`payment-option ${selectedMethod === 'card' ? 'selected' : ''}`}
                onClick={() => setSelectedMethod('card')}
              >
                <CreditCard size={32} />
                <div>
                  <h3>Credit/Debit Card</h3>
                  <p>Visa, Mastercard, AmEx</p>
                </div>
              </div>

              <div 
                className={`payment-option ${selectedMethod === 'gcash' ? 'selected' : ''}`}
                onClick={() => setSelectedMethod('gcash')}
              >
                <Smartphone size={32} />
                <div>
                  <h3>GCash</h3>
                  <p>Pay via GCash app</p>
                </div>
              </div>

              <div 
                className={`payment-option ${selectedMethod === 'paymaya' ? 'selected' : ''}`}
                onClick={() => setSelectedMethod('paymaya')}
              >
                <Wallet size={32} />
                <div>
                  <h3>PayMaya</h3>
                  <p>Pay via PayMaya app</p>
                </div>
              </div>

              <div 
                className={`payment-option ${selectedMethod === 'cash' ? 'selected' : ''}`}
                onClick={() => setSelectedMethod('cash')}
              >
                <Wallet size={32} />
                <div>
                  <h3>Cash</h3>
                  <p>Pay at the clinic</p>
                </div>
              </div>
            </div>

            {selectedMethod === 'card' && (
              <div className="card-form">
                <h3>Card Details</h3>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    value={cardDetails.cardName}
                    onChange={handleCardChange}
                    placeholder="JOHN DOE"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                      placeholder="123"
                      maxLength="3"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod && selectedMethod !== 'card' && (
              <div className="payment-instructions">
                <h3>Payment Instructions</h3>
                {selectedMethod === 'gcash' && (
                  <p>You will be redirected to the GCash app to complete your payment.</p>
                )}
                {selectedMethod === 'paymaya' && (
                  <p>You will be redirected to the PayMaya app to complete your payment.</p>
                )}
                {selectedMethod === 'cash' && (
                  <p>Please bring ₱{consultation.consultationFee} cash on your appointment date.</p>
                )}
              </div>
            )}

            <button 
              onClick={handlePayment}
              className="btn btn-primary btn-pay"
              disabled={!selectedMethod || processing}
            >
              {processing ? 'Processing...' : `Pay ₱${consultation.consultationFee}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
