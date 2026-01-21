
import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface UserAvatarProps {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
  // Deprecated props kept to prevent breaking changes, but unused
  variant?: any;
}

const BG_COLORS = [
  'bg-orange-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-green-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-amber-500'
];

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  size = 40,
  className = '',
  src,
  onClick
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset error when src property changes
  useEffect(() => {
    setImgError(false);
  }, [src]);

  // Deterministic random color based on name
  const getColorIndex = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % BG_COLORS.length);
  };

  // Use neutral gray for default/loading state instead of mapping 'User' to green
  const isDefaultUser = !name || name === 'User';
  const bgColor = isDefaultUser ? 'bg-zinc-800' : BG_COLORS[getColorIndex(name)];

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${bgColor} text-white`}>
          {/* Logo Icon as Profile */}
          <Zap className="fill-white/30" style={{ width: size * 0.5, height: size * 0.5 }} />
        </div>
      )}
    </div>
  );
};
