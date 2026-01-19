'use client';

import React from 'react';

interface WalkingAnimationProps {
  isActive: boolean;
  size?: number;
}

export default function WalkingAnimation({ isActive, size = 160 }: WalkingAnimationProps) {
  const animationState = isActive ? 'running' : 'paused';

  return (
    <div
      className="relative rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      {/* Sky background - urban sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-300 to-blue-200" />

      {/* Sun */}
      <div
        className="absolute top-4 right-8 w-10 h-10 bg-yellow-300 rounded-full"
        style={{ boxShadow: '0 0 25px 8px rgba(253, 224, 71, 0.4)' }}
      />

      {/* Clouds */}
      <div
        className="absolute top-8 clouds-layer"
        style={{ animationPlayState: animationState }}
      >
        <svg className="w-16 h-8 text-white/90" viewBox="0 0 80 40" fill="currentColor">
          <ellipse cx="25" cy="25" rx="18" ry="12" />
          <ellipse cx="45" cy="22" rx="15" ry="10" />
          <ellipse cx="60" cy="26" rx="12" ry="9" />
        </svg>
      </div>

      {/* Background buildings - far away */}
      <div
        className="absolute bottom-20 w-[400%] buildings-far-layer"
        style={{ animationPlayState: animationState }}
      >
        <div className="flex gap-2 items-end">
          {[...Array(12)].map((_, i) => (
            <div key={`far-building-${i}`} className="flex flex-col items-center">
              <div 
                className="bg-gray-400/60 relative"
                style={{ 
                  width: `${16 + (i % 3) * 6}px`, 
                  height: `${30 + (i % 4) * 12}px` 
                }}
              >
                {/* Windows */}
                <div className="absolute inset-1 grid grid-cols-2 gap-1">
                  {[...Array(6)].map((_, w) => (
                    <div key={w} className="w-1.5 h-1 bg-yellow-200/40" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mid-distance buildings */}
      <div
        className="absolute bottom-20 w-[350%] buildings-mid-layer"
        style={{ animationPlayState: animationState }}
      >
        <div className="flex gap-3 items-end">
          {[...Array(10)].map((_, i) => (
            <div key={`mid-building-${i}`} className="flex flex-col items-center">
              <div 
                className="bg-gradient-to-t from-gray-500 to-gray-400 relative rounded-t"
                style={{ 
                  width: `${24 + (i % 3) * 8}px`, 
                  height: `${40 + (i % 5) * 16}px` 
                }}
              >
                {/* Windows grid */}
                <div className="absolute inset-2 grid grid-cols-3 gap-1">
                  {[...Array(12)].map((_, w) => (
                    <div 
                      key={w} 
                      className="w-2 h-2 rounded-sm"
                      style={{ 
                        backgroundColor: Math.random() > 0.3 ? '#fef08a' : '#94a3b8' 
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Road/Ground */}
      <div className="absolute bottom-0 w-full h-12 bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800">
        {/* Road markings */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-[300%] h-1 road-markings"
          style={{ animationPlayState: animationState }}
        >
          <div className="flex gap-8">
            {[...Array(20)].map((_, i) => (
              <div key={`marking-${i}`} className="w-8 h-1 bg-yellow-300" />
            ))}
          </div>
        </div>
      </div>

      {/* Sidewalk */}
      <div className="absolute bottom-12 w-full h-8 bg-gray-400" />

      {/* Foreground buildings and elements */}
      <div
        className="absolute bottom-20 w-[300%] buildings-front-layer"
        style={{ animationPlayState: animationState }}
      >
        <div className="flex gap-12 items-end">
          {[...Array(8)].map((_, i) => (
            <div key={`front-building-${i}`} className="flex gap-4 items-end">
              {/* Building */}
              <div 
                className="bg-gradient-to-t from-blue-900 to-blue-700 relative rounded-t-sm"
                style={{ 
                  width: `${30 + (i % 2) * 12}px`, 
                  height: `${60 + (i % 3) * 20}px` 
                }}
              >
                {/* Windows */}
                <div className="absolute inset-2 flex flex-col gap-1.5">
                  {[...Array(5)].map((_, row) => (
                    <div key={row} className="flex gap-1.5 justify-center">
                      {[...Array(3)].map((_, col) => (
                        <div 
                          key={col} 
                          className="w-2.5 h-2 rounded-sm"
                          style={{ 
                            backgroundColor: Math.random() > 0.4 ? '#fbbf24' : '#64748b' 
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Street elements */}
              {i % 3 === 0 && (
                <div className="flex flex-col items-center gap-1">
                  {/* Traffic light */}
                  <div className="w-2.5 h-7 bg-gray-800 rounded flex flex-col items-center justify-around py-0.5">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    <div className="w-1 h-1 rounded-full bg-yellow-500/40" />
                    <div className="w-1 h-1 rounded-full bg-green-500/40" />
                  </div>
                  <div className="w-0.5 h-5 bg-gray-700" />
                </div>
              )}

              {/* Tree */}
              {i % 2 === 1 && (
                <svg className="w-6 h-10" viewBox="0 0 30 50">
                  <rect x="12" y="30" width="6" height="15" fill="#8B5A2B" />
                  <circle cx="15" cy="25" r="12" fill="#22c55e" />
                  <circle cx="10" cy="28" r="8" fill="#16a34a" />
                  <circle cx="20" cy="28" r="8" fill="#16a34a" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cars on the road */}
      <div
        className="absolute bottom-2 w-[300%] cars-layer"
        style={{ animationPlayState: animationState }}
      >
        <div className="flex gap-20 items-center">
          {[...Array(8)].map((_, i) => (
            <div key={`vehicle-${i}`}>
              {i % 4 === 0 ? (
                // Bus
                <svg className="w-20 h-9" viewBox="0 0 90 40">
                  <rect x="5" y="12" width="80" height="22" rx="2" fill="#f59e0b" />
                  <rect x="8" y="8" width="74" height="6" rx="1" fill="#d97706" />
                  {/* Windows */}
                  <rect x="12" y="15" width="10" height="8" fill="#bfdbfe" opacity="0.7" />
                  <rect x="25" y="15" width="10" height="8" fill="#bfdbfe" opacity="0.7" />
                  <rect x="38" y="15" width="10" height="8" fill="#bfdbfe" opacity="0.7" />
                  <rect x="51" y="15" width="10" height="8" fill="#bfdbfe" opacity="0.7" />
                  <rect x="64" y="15" width="10" height="8" fill="#bfdbfe" opacity="0.7" />
                  {/* Wheels */}
                  <circle cx="20" cy="34" r="4" fill="#1e293b" />
                  <circle cx="70" cy="34" r="4" fill="#1e293b" />
                  <circle cx="20" cy="34" r="2" fill="#64748b" />
                  <circle cx="70" cy="34" r="2" fill="#64748b" />
                  {/* Headlights */}
                  <circle cx="82" cy="22" r="2" fill="#fef08a" />
                </svg>
              ) : i % 4 === 1 ? (
                // Truck
                <svg className="w-16 h-9" viewBox="0 0 75 40">
                  <rect x="5" y="15" width="35" height="18" rx="2" fill="#16a34a" />
                  <rect x="42" y="8" width="28" height="25" rx="2" fill="#15803d" />
                  <rect x="45" y="12" width="10" height="8" fill="#bfdbfe" opacity="0.7" />
                  <rect x="58" y="12" width="8" height="8" fill="#bfdbfe" opacity="0.7" />
                  {/* Wheels */}
                  <circle cx="15" cy="33" r="4" fill="#1e293b" />
                  <circle cx="32" cy="33" r="4" fill="#1e293b" />
                  <circle cx="60" cy="33" r="4" fill="#1e293b" />
                  <circle cx="15" cy="33" r="2" fill="#64748b" />
                  <circle cx="32" cy="33" r="2" fill="#64748b" />
                  <circle cx="60" cy="33" r="2" fill="#64748b" />
                  <circle cx="68" cy="22" r="2" fill="#fef08a" />
                </svg>
              ) : (
                // Regular car
                <svg className="w-14 h-8" viewBox="0 0 70 35">
                  <rect x="5" y="15" width="60" height="14" rx="3" fill={i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#ef4444" : "#8b5cf6"} />
                  <path d="M 18 15 L 23 6 L 47 6 L 52 15 Z" fill={i % 3 === 0 ? "#2563eb" : i % 3 === 1 ? "#dc2626" : "#7c3aed"} />
                  <rect x="26" y="9" width="10" height="6" fill="#bfdbfe" opacity="0.7" />
                  <rect x="38" y="9" width="10" height="6" fill="#bfdbfe" opacity="0.7" />
                  <circle cx="18" cy="29" r="4" fill="#1e293b" />
                  <circle cx="52" cy="29" r="4" fill="#1e293b" />
                  <circle cx="18" cy="29" r="2" fill="#64748b" />
                  <circle cx="52" cy="29" r="2" fill="#64748b" />
                  <circle cx="62" cy="21" r="2" fill="#fef08a" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Other people walking on sidewalk */}
      <div
        className="absolute bottom-12 w-[300%] people-layer"
        style={{ animationPlayState: animationState }}
      >
        <div className="flex gap-20 items-end">
          {[...Array(8)].map((_, i) => (
            <div key={`person-${i}`} className="person-walk">
              <svg className="w-6 h-10" viewBox="0 0 32 48">
                {/* Person silhouette */}
                <circle cx="16" cy="8" r="4" fill="#d4a574" />
                {/* Body */}
                <rect x="12" y="12" width="8" height="12" rx="2" fill={i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#ec4899" : "#10b981"} />
                {/* Legs */}
                <rect x="12" y="24" width="3" height="10" rx="1" fill="#1e293b" />
                <rect x="17" y="24" width="3" height="10" rx="1" fill="#1e293b" />
                {/* Arms */}
                <rect x="9" y="14" width="2" height="8" rx="1" fill="#d4a574" />
                <rect x="21" y="14" width="2" height="8" rx="1" fill="#d4a574" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Main running character - stays in center */}
      <div className="absolute inset-0 flex items-end justify-center pb-12">
        <div
          className="runner-bounce"
          style={{ animationPlayState: animationState }}
        >
          <svg className="w-16 h-20" viewBox="0 0 80 96">
            <defs>
              <linearGradient id="skinTone" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d4a574" />
                <stop offset="100%" stopColor="#c4936b" />
              </linearGradient>
              <linearGradient id="shirtTone" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="shortsTone" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>

            {/* Shadow */}
            <ellipse cx="40" cy="92" rx="14" ry="3" fill="rgba(0,0,0,0.3)" />

            {/* Back leg */}
            <g className="leg-back" style={{ transformOrigin: '42px 66px', animationPlayState: animationState }}>
              <line x1="42" y1="66" x2="48" y2="78" stroke="url(#shortsTone)" strokeWidth="7" strokeLinecap="round" />
              <line x1="48" y1="78" x2="52" y2="88" stroke="url(#skinTone)" strokeWidth="5" strokeLinecap="round" />
              <ellipse cx="54" cy="89" rx="6" ry="3" fill="#059669" transform="rotate(-10 54 89)" />
              <ellipse cx="54" cy="88.5" rx="4" ry="2" fill="#10b981" transform="rotate(-10 54 88.5)" />
            </g>

            {/* Torso */}
            <ellipse cx="38" cy="50" rx="12" ry="16" fill="url(#shirtTone)" transform="rotate(-8 38 50)" />
            
            {/* Shorts */}
            <ellipse cx="40" cy="64" rx="11" ry="8" fill="url(#shortsTone)" transform="rotate(-5 40 64)" />

            {/* Back arm */}
            <g className="arm-back" style={{ transformOrigin: '36px 46px', animationPlayState: animationState }}>
              <line x1="36" y1="46" x2="44" y2="54" stroke="url(#shirtTone)" strokeWidth="6" strokeLinecap="round" />
              <line x1="44" y1="54" x2="48" y2="62" stroke="url(#skinTone)" strokeWidth="5" strokeLinecap="round" />
              <ellipse cx="49" cy="64" rx="3" ry="3.5" fill="url(#skinTone)" />
            </g>

            {/* Front leg */}
            <g className="leg-front" style={{ transformOrigin: '38px 66px', animationPlayState: animationState }}>
              <line x1="38" y1="66" x2="32" y2="78" stroke="url(#shortsTone)" strokeWidth="7" strokeLinecap="round" />
              <line x1="32" y1="78" x2="28" y2="88" stroke="url(#skinTone)" strokeWidth="5" strokeLinecap="round" />
              <ellipse cx="26" cy="89" rx="6" ry="3" fill="#059669" transform="rotate(-10 26 89)" />
              <ellipse cx="26" cy="88.5" rx="4" ry="2" fill="#10b981" transform="rotate(-10 26 88.5)" />
            </g>

            {/* Neck */}
            <ellipse cx="34" cy="38" rx="4" ry="5" fill="url(#skinTone)" />

            {/* Head */}
            <ellipse cx="32" cy="26" rx="11" ry="13" fill="url(#skinTone)" />
            
            {/* Hair */}
            <path d="M 24 18 Q 28 12 36 14 Q 42 16 43 22 L 40 28 Q 35 24 28 26 Z" fill="#2d3748" />
            
            {/* Ear */}
            <ellipse cx="23" cy="26" rx="2.5" ry="4" fill="#c4936b" />
            <ellipse cx="23" cy="26" rx="1.5" ry="2.5" fill="#d4a574" />
            
            {/* Eye */}
            <ellipse cx="30" cy="24" rx="3" ry="3.5" fill="white" />
            <ellipse cx="31" cy="24" rx="2" ry="2.5" fill="#1e293b" />
            <circle cx="31.5" cy="23" r="0.8" fill="white" />
            
            {/* Eyebrow */}
            <path d="M 27 20 Q 31 19 34 20" stroke="#2d3748" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            
            {/* Nose */}
            <path d="M 36 24 L 40 27 L 38 29 Q 36 28 36 27" fill="#c4936b" />
            
            {/* Smile */}
            <path d="M 36 32 Q 38 34 35 33" stroke="#8b6f47" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 36 32 L 34 32" stroke="#8b6f47" strokeWidth="1" strokeLinecap="round" />

            {/* Front arm */}
            <g className="arm-front" style={{ transformOrigin: '34px 46px', animationPlayState: animationState }}>
              <line x1="34" y1="46" x2="26" y2="38" stroke="url(#shirtTone)" strokeWidth="6" strokeLinecap="round" />
              <line x1="26" y1="38" x2="20" y2="44" stroke="url(#skinTone)" strokeWidth="5" strokeLinecap="round" />
              <ellipse cx="19" cy="46" rx="3" ry="3.5" fill="url(#skinTone)" />
            </g>
          </svg>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        .clouds-layer {
          animation: scroll-horizontal 25s linear infinite;
        }

        .buildings-far-layer {
          animation: scroll-horizontal 12s linear infinite;
        }

        .buildings-mid-layer {
          animation: scroll-horizontal 8s linear infinite;
        }

        .buildings-front-layer {
          animation: scroll-horizontal 5s linear infinite;
        }

        .road-markings {
          animation: scroll-horizontal 2s linear infinite;
        }

        .cars-layer {
          animation: scroll-horizontal 4s linear infinite;
        }

        .people-layer {
          animation: scroll-horizontal 6s linear infinite;
        }

        .runner-bounce {
          animation: run-bounce 0.3s ease-in-out infinite;
        }

        .person-walk {
          animation: person-bob 0.4s ease-in-out infinite;
        }

        .arm-front {
          animation: swing-arm-front 0.3s ease-in-out infinite;
        }

        .arm-back {
          animation: swing-arm-back 0.3s ease-in-out infinite;
        }

        .leg-front {
          animation: swing-leg-front 0.3s ease-in-out infinite;
        }

        .leg-back {
          animation: swing-leg-back 0.3s ease-in-out infinite;
        }

        @keyframes scroll-horizontal {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }

        @keyframes run-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes person-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes swing-arm-front {
          0%, 100% { transform: rotate(-45deg); }
          50% { transform: rotate(45deg); }
        }

        @keyframes swing-arm-back {
          0%, 100% { transform: rotate(45deg); }
          50% { transform: rotate(-45deg); }
        }

        @keyframes swing-leg-front {
          0%, 100% { transform: rotate(35deg); }
          50% { transform: rotate(-35deg); }
        }

        @keyframes swing-leg-back {
          0%, 100% { transform: rotate(-35deg); }
          50% { transform: rotate(35deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .clouds-layer,
          .buildings-far-layer,
          .buildings-mid-layer,
          .buildings-front-layer,
          .road-markings,
          .cars-layer,
          .people-layer,
          .runner-bounce,
          .person-walk,
          .arm-front,
          .arm-back,
          .leg-front,
          .leg-back {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
