import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
};

export const Button: React.FC<Props> = ({ 
  variant = "primary", 
  size = "md", 
  className = "", 
  ...props 
}) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const sizes = { 
    sm: "px-2.5 py-1.5 text-sm", 
    md: "px-3.5 py-2 text-sm", 
    lg: "px-4.5 py-2.5 text-base" 
  };
  const variants = {
    primary: "bg-primary text-white hover:opacity-90 focus:ring-primary",
    secondary: "bg-surface text-primary border border-gray-300 hover:bg-gray-50 focus:ring-primary",
    ghost: "bg-transparent text-primary hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
  };
  
  return (
    <button 
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} 
      {...props} 
    />
  );
};
