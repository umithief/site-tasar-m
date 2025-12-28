
import React from 'react';
import Avatar from 'boring-avatars';

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: number;
  variant?: 'beam' | 'marble' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';
  className?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  src,
  size = 40,
  variant = 'beam',
  className = '',
  onClick
}) => {
  const colors = ["#ff1f1f", "#050505", "#ffffff", "#27272a", "#a1a1aa"];

  return (
    <div
      className={`overflow-hidden rounded-full flex-shrink-0 bg-gray-200 object-cover ${className}`}
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
