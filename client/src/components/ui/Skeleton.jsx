export function Skeleton({ height = '20px', width = '100%', className = '' }) {
  return (
    <div
      className={className}
      style={{
        height,
        width,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'loading 1.5s infinite',
        borderRadius: '4px',
      }}
    >
      <style>
        {`
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </div>
  );
}
