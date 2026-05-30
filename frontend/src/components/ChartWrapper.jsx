const ChartWrapper = ({ title, subtitle, children }) => {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
};

export default ChartWrapper;
