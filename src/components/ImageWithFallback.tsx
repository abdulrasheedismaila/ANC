import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  fallbackIcon?: React.ReactNode;
  fallbackClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackText,
  fallbackIcon,
  fallbackClassName = 'bg-[#F3F8F9] text-[#075765] flex items-center justify-center p-4 rounded text-center font-medium',
  className,
  ...props
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${fallbackClassName} ${className || ''}`}>
        {fallbackIcon && <span className="mr-2 inline-block">{fallbackIcon}</span>}
        <span>{fallbackText || alt || 'Image unavailable'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
      {...props}
    />
  );
};
