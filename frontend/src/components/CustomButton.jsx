const CustomButton = ({ children, variant = 'primary', loading, className = '', ...props }) => {
  const variantClass = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  }[variant] || 'btn-primary';

  return (
    <button
      className={`btn ${variantClass} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
};

export default CustomButton;
