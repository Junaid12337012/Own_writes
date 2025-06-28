import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles = "font-medium rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary-800 transition-all duration-200 ease-in-out inline-flex items-center justify-center shadow-sm hover:shadow"; 
  
  const variantStyles = {
    primary: "bg-accent-400 text-white hover:bg-accent-500 focus-visible:ring-accent-400 dark:bg-accent-500 dark:hover:bg-accent-400 dark:focus-visible:ring-accent-500 active:scale-95", 
    secondary: "bg-accent-50 text-accent-500 hover:bg-accent-100 focus-visible:ring-accent-400 border border-secondary-300 dark:bg-primary-700 dark:text-accent-300 dark:hover:bg-primary-600 dark:border-primary-600 dark:focus-visible:ring-accent-400 active:scale-95", 
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 dark:focus-visible:ring-red-500 active:scale-95",
    ghost: "bg-transparent text-accent-500 hover:bg-accent-100 focus-visible:ring-accent-400 hover:text-accent-600 dark:text-accent-400 dark:hover:bg-primary-700 dark:hover:text-accent-300 dark:focus-visible:ring-accent-400", 
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm", 
    md: "px-4 py-2 text-base", 
    lg: "px-6 py-2.5 text-lg", 
  };

  const loadingStyles = isLoading ? "opacity-75 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${loadingStyles} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2 h-5 w-5 flex items-center justify-center">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2 h-5 w-5 flex items-center justify-center">{rightIcon}</span>}
    </button>
  );
};

export default Button;