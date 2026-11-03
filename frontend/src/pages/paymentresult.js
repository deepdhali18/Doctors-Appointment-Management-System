
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PaymentResult = () => {
  const { state } = useLocation();

  const status = state?.status || 'unknown';
  const message =
    state?.message || 'No payment result is available.';
  const paymentId = state?.paymentId;

  const isPaid = status === 'paid';
  const isFailed = status === 'failed';
  const isCancelled = status === 'cancelled';

  const result = {
    paid: {
      title: 'Payment Successful!',
      subtitle: 'Your demo payment has been completed.',
      icon: '✓',
      color: '#16a34a',
      background: '#dcfce7',
    },
    failed: {
      title: 'Payment Failed',
      subtitle: 'Your demo payment could not be completed.',
      icon: '!',
      color: '#dc2626',
      background: '#fee2e2',
    },
    cancelled: {
      title: 'Payment Cancelled',
      subtitle: 'Your payment process was cancelled.',
      icon: '×',
      color: '#d97706',
      background: '#fef3c7',
    },
    unknown: {
      title: 'Payment Status',
      subtitle: 'We could not find a payment result.',
      icon: '?',
      color: '#64748b',
      background: '#f1f5f9',
    },
  }[status] || {
    title: 'Payment Status',
    subtitle: 'Please check your appointment details.',
    icon: '?',
    color: '#64748b',
    background: '#f1f5f9',
  };

  const styles = {
    page: {
      minHeight: '100vh',
      padding: '28px 16px',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background:
        'linear-gradient(135deg, #eef5ff 0%, #f5f3ff 50%, #ecfeff 100%)',
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    },
    card: {
      width: '100%',
      maxWidth: '530px',
      padding: '36px',
      boxSizing: 'border-box',
      background: '#ffffff',
      borderRadius: '26px',
      border: '1px solid #e8edfa',
      boxShadow: '0 20px 60px rgba(30, 64, 175, 0.12)',
      textAlign: 'center',
    },
    brand: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '32px',
      color: '#1d4ed8',
      fontSize: '24px',
      fontWeight: 800,
      letterSpacing: '-0.7px',
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
    statusIcon: {
      width: '88px',
      height: '88px',
      borderRadius: '50%',
      background: result.background,
      color: result.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '52px',
      fontWeight: 700,
      margin: '0 auto 22px',
      border: `5px solid ${result.background}`,
    },
    heading: {
      fontSize: '30px',
      letterSpacing: '-0.8px',
      color: '#172554',
      margin: '0 0 10px',
    },
    subtitle: {
      color: '#64748b',
      fontSize: '15px',
      lineHeight: 1.6,
      margin: '0 0 24px',
    },
    message: {
      padding: '15px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '13px',
      color: '#334155',
      fontSize: '14px',
      lineHeight: 1.6,
      overflowWrap: 'anywhere',
      marginBottom: '18px',
    },
    reference: {
      textAlign: 'left',
      padding: '14px',
      borderRadius: '12px',
      background: '#f5f3ff',
      border: '1px solid #e9d5ff',
      marginBottom: '18px',
      overflowWrap: 'anywhere',
    },
    referenceLabel: {
      display: 'block',
      fontSize: '11px',
      color: '#6d28d9',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.7px',
      marginBottom: '7px',
    },
    referenceValue: {
      color: '#4c1d95',
      fontSize: '13px',
      fontWeight: 600,
      wordBreak: 'break-all',
    },
    demoNotice: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      textAlign: 'left',
      padding: '14px',
      background: '#eff6ff',
      border: '1px solid #dbeafe',
      borderRadius: '12px',
      color: '#1e40af',
      fontSize: '12px',
      lineHeight: 1.6,
      marginBottom: '26px',
    },
    buttons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    primaryButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      padding: '16px',
      borderRadius: '13px',
      background: 'linear-gradient(135deg, #4f46e5, #2563eb)',
      color: '#ffffff',
      textDecoration: 'none',
      fontWeight: 700,
      fontSize: '15px',
      boxShadow: '0 8px 20px rgba(79, 70, 229, 0.2)',
      transition: 'transform 0.2s ease',
    },
    secondaryButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      padding: '15px',
      borderRadius: '13px',
      background: '#ffffff',
      border: '1px solid #cbd5e1',
      color: '#334155',
      textDecoration: 'none',
      fontWeight: 700,
      fontSize: '15px',
      transition: 'background 0.2s ease',
    },
    footer: {
      marginTop: '26px',
      color: '#94a3b8',
      fontSize: '11px',
    },
  };

  return (
    <div style={styles.page}>
      <main style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.logo}>✚</span>
          MediConnect
        </div>

        <div
          style={styles.statusIcon}
          role="img"
          aria-label={result.title}
        >
          {result.icon}
        </div>

        <h1 style={styles.heading}>{result.title}</h1>

        <p style={styles.subtitle}>{result.subtitle}</p>

        <div role="status" style={styles.message}>
          {message}
        </div>

        {paymentId && (
          <div style={styles.reference}>
            <span style={styles.referenceLabel}>
              Demo Payment Reference
            </span>
            <span style={styles.referenceValue}>
              {paymentId}
            </span>
          </div>
        )}

        {isPaid && (
          <div style={styles.demoNotice}>
            <span style={{ fontSize: '20px' }}>ℹ️</span>
            <span>
              <strong>Demo Confirmation</strong>
              <br />
              This is a simulated payment confirmation.
              No real money was transferred.
            </span>
          </div>
        )}

        {isFailed && (
          <div style={styles.demoNotice}>
            <span style={{ fontSize: '20px' }}>ℹ️</span>
            <span>
              This was a simulated failed payment.
              Check your appointment details before trying again.
            </span>
          </div>
        )}

        <div style={styles.buttons}>
          <Link
            to="/appointments"
            style={styles.primaryButton}
          >
            <span>▣</span>
            View Appointments
            <span>→</span>
          </Link>

          <Link
            to="/doctors"
            style={styles.secondaryButton}
          >
            <span>＋</span>
            Browse Doctors
          </Link>
        </div>

        <div style={styles.footer}>
          MediConnect 
        </div>
      </main>
    </div>
  );
};

export default PaymentResult;
