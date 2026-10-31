import React from "react";

// Kerala Kasavu Gold Border Ribbon
export function KasavuBorder({ className = "" }) {
  return (
    <div className={`kasavu-ribbon ${className}`}>
      <div className="kasavu-stripe-outer" />
      <div className="kasavu-stripe-inner" />
      <div className="kasavu-pattern">
        <span>◆</span>
        <span>❖</span>
        <span>◆</span>
        <span>❖</span>
        <span>◆</span>
      </div>
      <div className="kasavu-stripe-inner" />
      <div className="kasavu-stripe-outer" />
    </div>
  );
}

// Kerala Traditional Nilavilakku (Auspicious Brass Lamp) Icon
export function NilavilakkuIcon({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Flame */}
      <path
        d="M32 4C30 11 25 15 25 20C25 24 28 27 32 27C36 27 39 24 39 20C39 15 34 11 32 4Z"
        fill="url(#flameGrad)"
      />
      <circle cx="32" cy="20" r="3" fill="#FFF7CC" />
      {/* Wick top */}
      <rect x="31" y="26" width="2" height="3" fill="#8C5311" />
      {/* Upper Oil Dish */}
      <path
        d="M18 29C18 29 20 35 32 35C44 35 46 29 46 29H18Z"
        fill="url(#brassGrad)"
        stroke="#8C5311"
        strokeWidth="1"
      />
      {/* Central Pillar Stem */}
      <path
        d="M30 35H34V46H30V35Z"
        fill="url(#brassGrad)"
      />
      <circle cx="32" cy="40" r="3" fill="#FFD700" stroke="#8C5311" strokeWidth="0.8" />
      {/* Tier 2 Dish */}
      <ellipse cx="32" cy="46" rx="10" ry="2.5" fill="url(#brassGrad)" stroke="#8C5311" strokeWidth="0.8" />
      {/* Lower Stem */}
      <path
        d="M29 48H35V53H29V48Z"
        fill="url(#brassGrad)"
      />
      {/* Wide Base */}
      <path
        d="M20 58C20 54 25 53 32 53C39 53 44 54 44 58C44 60 40 61 32 61C24 61 20 60 20 58Z"
        fill="url(#brassGrad)"
        stroke="#8C5311"
        strokeWidth="1"
      />
      {/* Gradients */}
      <defs>
        <linearGradient id="flameGrad" x1="32" y1="4" x2="32" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF176" />
          <stop offset="0.45" stopColor="#FFB300" />
          <stop offset="1" stopColor="#E65100" />
        </linearGradient>
        <linearGradient id="brassGrad" x1="18" y1="29" x2="46" y2="61" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF2A3" />
          <stop offset="0.3" stopColor="#E5C158" />
          <stop offset="0.7" stopColor="#C9971D" />
          <stop offset="1" stopColor="#7E5806" />
        </linearGradient>
      </defs>
    </svg>
  );
}

