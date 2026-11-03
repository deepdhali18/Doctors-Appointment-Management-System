import React from 'react';

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{
          padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px',
          background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer',
          opacity: page <= 1 ? 0.5 : 1, fontWeight: 500,
        }}
      >
        &laquo; Prev
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            padding: '8px 16px', border: 'none', borderRadius: '8px',
            background: p === page ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f0f0f0',
            color: p === page ? '#fff' : '#333', cursor: 'pointer',
            fontWeight: p === page ? 600 : 400,
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        style={{
          padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px',
          background: '#fff', cursor: page >= pages ? 'not-allowed' : 'pointer',
          opacity: page >= pages ? 0.5 : 1, fontWeight: 500,
        }}
      >
        Next &raquo;
      </button>
    </div>
  );
};

export default Pagination;
