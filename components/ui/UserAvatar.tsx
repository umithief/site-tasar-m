
import React from 'react';
import Avatar from 'boring-avatars';

interface UserAvatarProps {
  name: string;
  size?: number;
  variant?: 'beam' | 'marble' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';
  className?: string;
  src?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 40,
  variant = 'beam',
  className = '',
  src
}) => {
  const colors = ["#ff1f1f", "#050505", "#ffffff", "#27272a", "#a1a1aa"];

  if (src) {
    return (
      <div className={`overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
      <Avatar
        size={size}
        name={name}
        variant={variant}
        colors={colors}
      />
    </div>
  );
};
