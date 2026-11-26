import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IdentityVerificationInfo } from '../types/identity-verification.types';

export function useOfferRideGate(
  identityVerification?: IdentityVerificationInfo | null,
  onSyncUserVerification?: (info: IdentityVerificationInfo) => void,
) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isVerified = identityVerification?.status === 'verified';

  const handleOfferRideClick = () => {
    if (isVerified) {
      navigate('/rides/create');
      return;
    }
    setIsModalOpen(true);
  };

  const handleVerified = (info: IdentityVerificationInfo) => {
    onSyncUserVerification?.(info);
    setIsModalOpen(false);
    navigate('/rides/create');
  };

  return {
    isVerified,
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    handleOfferRideClick,
    handleVerified,
  };
}
