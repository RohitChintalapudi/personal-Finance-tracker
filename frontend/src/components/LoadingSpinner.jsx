const LoadingSpinner = ({ size = 32, fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div className="spinner spinner-dark" style={{ width: size, height: size }} />
      </div>
    );
  }
  return <div className="spinner spinner-dark" style={{ width: size, height: size }} />;
};

export const SkeletonCards = ({ count = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-card">
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '40%', height: 12 }} />
        </div>
        <div className="skeleton" style={{ width: 70, height: 16 }} />
      </div>
    ))}
  </div>
);

export default LoadingSpinner;
