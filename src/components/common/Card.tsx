import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  const baseClass = hover ? 'card-hover' : 'card';
  return <div className={`${baseClass} ${className}`}>{children}</div>;
}
