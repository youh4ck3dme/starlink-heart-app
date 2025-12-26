import React from 'react';
import Lottie from 'lottie-react';
import confettiJson from '../../assets/lottie/confetti.json';

export function RewardConfetti() {
  return <Lottie animationData={confettiJson} loop={false} className="pointer-events-none absolute inset-0 z-50" />;
}
