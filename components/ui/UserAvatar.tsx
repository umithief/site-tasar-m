
import React from 'react';
import Avatar from 'boring-avatars';

interface UserAvatarProps {
  name: string;
  size?: number;
  variant?: 'beam' | 'marble' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';
  className?: string;
  src?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 40,
  variant = 'beam',
  className = '',
  src,
  onClick
}) => {
  const colors = ["#ff1f1f", "#050505", "#ffffff", "#27272a", "#a1a1aa"];

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <Avatar
          size={size}
          name={name}
          variant={variant}
          colors={colors}
        />
      )}
    </div>
  );
};
