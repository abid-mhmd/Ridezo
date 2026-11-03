interface UserAvatarProps {
  firstName: string;
  lastName?: string;
  profilePhoto?: string | null;
  size?: 'small' | 'large' | 'profile';
}

export default function UserAvatar({
  firstName,
  lastName,
  profilePhoto,
  size = 'small',
}: UserAvatarProps) {
  const sizeClasses = {
    small: 'h-9 w-9 rounded-xl text-xs',
    large: 'h-20 w-20 rounded-2xl text-2xl',
    profile: 'h-24 w-24 rounded-2xl text-3xl',
  }[size];

  if (profilePhoto) {
    return (
      <img
        src={profilePhoto}
        alt={`${firstName} ${lastName}`}
        className={`shrink-0 border border-[#263044] object-cover ${sizeClasses}`}
      />
    );
  }

  const initials =
    `${firstName.charAt(0)}${lastName?.charAt(0) ?? ''}`.toUpperCase() || 'U';

  return (
    <div
      className={`flex shrink-0 items-center justify-center border border-[#C37DF5]/20 bg-gradient-to-br from-[#C37DF5]/20 to-[#D56BCF]/20 font-bold text-[#C37DF5] ${sizeClasses}`}
    >
      {initials}
    </div>
  );
}
