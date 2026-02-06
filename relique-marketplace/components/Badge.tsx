
import React from 'react';
import { VerificationStatus } from '../types';
import { COLORS } from '../constants';

interface BadgeProps {
  status: VerificationStatus;
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getColors = () => {
    switch (status) {
      case VerificationStatus.QUALIFIED:
        return { text: COLORS.status.qualified, bg: 'rgba(34, 197, 94, 0.1)' };
      case VerificationStatus.INCONCLUSIVE:
        return { text: COLORS.status.inconclusive, bg: 'rgba(245, 158, 11, 0.1)' };
      case VerificationStatus.DISQUALIFIED:
        return { text: COLORS.status.disqualified, bg: 'rgba(239, 68, 68, 0.1)' };
      default:
        return { text: '#FFFFFF', bg: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  const colors = getColors();

  return (
    <span
      className="px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.3em] inline-block border border-white/10"
      style={{ color: colors.text, backgroundColor: colors.bg }}
    >
      {status}
    </span>
  );
};

export default Badge;
