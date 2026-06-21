import React from 'react';

const LOGO_URL = 'https://media.base44.com/images/public/6a14a8290af9b7a6761f47b4/93361018d_LELOGOOFFICIEL.png';

export default function DermaLogo({ size = 48, className = '' }) {
  return (
    <img
      src={LOGO_URL}
      alt="DermaCI"
      width={size}
      height={size}
      className={className}
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}