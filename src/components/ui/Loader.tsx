import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-slate-700 border-t-sky-500 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="mt-3 text-sm text-slate-400 font-medium">{text}</p>}
    </div>
  );
};

export default Loader;
