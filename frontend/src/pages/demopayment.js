
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const DemoPayment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const methods = [
    { id: 'upi', icon: '📱', title: 'UPI', subtitle: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', icon: '💳', title: 'Debit / Credit Card', subtitle: 'Visa, Mastercard and more' },
    { id: 'netbanking', icon: '🏦', title: 'Net Banking', subtitle: 'Pay through your bank' },
  ];

  const payNow = async () => {
    if (!method || loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await paymentAPI.createDemoPayment(
        appointmentId,
        method
      );

      const paymentId = response.data.payment._id;

      // Demo mode: payment succeeds by default.
      const result = await paymentAPI.completeDemoPayment(
        paymentId,
        'success'
      );

      navigate('/payment/result', {
        state: {
          status: result.data.payment.status,
          message: result.data.message,
          paymentId,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to process the payment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eef5ff 0%, #f5f3ff 50%, #ecfeff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '28px 16px',
      boxSizing: 'border-box',
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    },
    card: {
      width: '100%',
      maxWidth: '490px',
      background: '#ffffff',
      borderRadius: '24px',
      padding: '32px',
      boxSizing: 'border-box',
      boxShadow: '0 20px 60px rgba(30, 64, 175, 0.12)',
      border: '1px solid #e8edfa',
    },
    brand: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '26px',
      color: '#1d4ed8',
      fontSize: '25px',
      fontWeight: 800,
      letterSpacing: '-0.8px',
    },
    logo: {
      width: '42px',
      height: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      color: '#fff',
      borderRadius: '13px',
      fontSize: '24px',
    },
    heading: {
      textAlign: 'center',
      fontSize: '28px',
      color: '#172554',
      margin: '0 0 10px',
      letterSpacing: '-0.8px',
    },
    description: {
      textAlign: 'center',
      color: '#64748b',
      fontSize: '14px',
      lineHeight: 1.6,
      margin: '0 0 28px',
    },
    label: {
      display: 'block',
      color: '#26334d',
      fontWeight: 700,
      fontSize: '15px',
      marginBottom: '14px',
    },
    method: (selected) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      width: '100%',
      padding: '16px',
      marginBottom: '12px',
      border: selected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
      borderRadius: '15px',
      background: selected ? '#f5f3ff' : '#fff',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
    }),
    methodIcon: {
      width: '46px',
      height: '46px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f1f5f9',
      borderRadius: '12px',
      fontSize: '23px',
    },
    methodTitle: {
      display: 'block',
      fontWeight: 700,
      fontSize: '14px',
      color: '#1e293b',
      marginBottom: '5px',
    },
    methodSubtitle: {
      display: 'block',
      fontSize: '12px',
      color: '#64748b',
    },
    radio: {
      marginLeft: 'auto',
      width: '19px',
      height: '19px',
      flexShrink: 0,
      accentColor: '#4f46e5',
    },
    payButton: {
      width: '100%',
      border: 'none',
      borderRadius: '14px',
      padding: '16px',
      marginTop: '12px',
      background: loading
        ? '#94a3b8'
        : 'linear-gradient(135deg, #4f46e5, #2563eb)',
      color: '#fff',
      fontSize: '16px',
      fontWeight: 700,
      cursor: loading ? 'wait' : 'pointer',
      boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
      transition: 'transform 0.2s ease',
    },
    notice: {
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-start',
      padding: '13px',
      background: '#eff6ff',
      border: '1px solid #dbeafe',
      borderRadius: '12px',
      marginTop: '22px',
      color: '#1e40af',
      fontSize: '12px',
      lineHeight: 1.6,
    },
    error: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '10px',
      color: '#b91c1c',
      padding: '12px',
      fontSize: '13px',
      marginTop: '12px',
    },
    footer: {
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: '11px',
      marginTop: '24px',
    },
  };

  return (
    <div style={styles.page}>
      <main style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.logo}>✚</span>
          MediConnect
        </div>

        <h1 style={styles.heading}>Complete Your Payment</h1>

        <p style={styles.description}>
          Choose your preferred payment method to continue
          with your appointment.
        </p>

        <label style={styles.label}>
          Select a payment method
        </label>

        {methods.map((item) => (
          <button
            key={item.id}
            type="button"
            style={styles.method(method === item.id)}
            onClick={() => {
              setMethod(item.id);
              setError('');
            }}
            disabled={loading}
            aria-pressed={method === item.id}
          >
            <span style={styles.methodIcon}>{item.icon}</span>

            <span style={{ flex: 1 }}>
              <span style={styles.methodTitle}>{item.title}</span>
              <span style={styles.methodSubtitle}>{item.subtitle}</span>
            </span>

            <input
              type="radio"
              name="paymentMethod"
              value={item.id}
              checked={method === item.id}
              readOnly
              style={styles.radio}
              tabIndex={-1}
            />
          </button>
        ))}

        {error && (
          <div role="alert" style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {method && (
          <button
            type="button"
            style={styles.payButton}
            onClick={payNow}
            disabled={loading}
          >
            {loading ? '⏳ Processing Payment...' : '🔒 Make Payment →'}
          </button>
        )}

        <div style={styles.notice}>
          <span style={{ fontSize: '19px' }}>ℹ️</span>
          <span>
            <strong>Demo Payment Mode</strong>
            <br />
            This is a demonstration only. Clicking Make Payment
            will simulate a successful payment. No real money
            will be charged.
          </span>
        </div>

        <div style={styles.footer}>
          🔐 MediConnect · Demo Checkout
        </div>
      </main>
    </div>
  );
};

export default DemoPayment;
