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
      {/* Sky background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-100" />

      {/* Sun */}
      <div
        className="absolute top-4 right-6 w-8 h-8 bg-yellow-300 rounded-full"
        style={{ boxShadow: '0 0 20px 5px rgba(253, 224, 71, 0.5)' }}
      />

      {/* Mountains in far background */}
      <div className="absolute bottom-8 left-0 right-0 h-24 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
          <polygon points="0,100 30,40 60,70 90,30 120,60 150,50 180,70 200,55 200,100" fill="#6b7280" />
          <polygon points="0,100 20,60 50,80 80,50 110,75 140,65 170,80 200,70 200,100" fill="#9ca3af" opacity="0.7" />
        </svg>
      </div>

      {/* Clouds */}
      <div
        className="absolute top-6 clouds-layer"
        style={{ animationPlayState: animationState }}
      >
        <svg className="w-12 h-6 text-white/80" viewBox="0 0 60 30" fill="currentColor">
          <ellipse cx="20" cy="20" rx="15" ry="10" />
          <ellipse cx="35" cy="18" rx="12" ry="8" />
          <ellipse cx="45" cy="22" rx="10" ry="7" />
        </svg>
      </div>

      {/* Birds flying */}
      <div
        className="absolute top-12 left-8 birds-layer"
        style={{ animationPlayState: animationState }}
      >
        {[...Array(3)].map((_, i) => (
          <svg key={`bird-${i}`} className="w-6 h-4 text-slate-700/40 absolute" style={{ top: i * 8, left: i * 12 }} viewBox="0 0 24 16">
            <path d="M 2 8 Q 6 4 12 8 Q 18 4 22 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        ))}
      </div>

      {/* Background trees layer (slower, smaller - farther away) */}
      <div
        className="absolute bottom-8 w-[400%] bg-trees-layer"
        style={{ animationPlayState: animationState }}
      >
        <div className="flex gap-16 items-end">
          {[...Array(8)].map((_, i) => (
            <svg key={`bg-tree-${i}`} className="w-8 h-12 text-emerald-700/60" viewBox="0 0 40 60" fill="currentColor">
              <polygon points="20,0 35,40 5,40" />
              <rect x="16" y="40" width="8" height="12" fill="#6B4423" />
            </svg>
          ))}
        </div>
      </div>

      {/* Bushes and rocks layer */}
      <div
        className="absolute bottom-10 w-[350%] grass-layer"
        style={{ animationPlayState: animationState }}
      >
        <div className="flex gap-12 items-end">
          {[...Array(12)].map((_, i) => (
            <div key={`bush-rock-${i}`} className="flex gap-6 items-end">
              {/* Bush */}
              {i % 2 === 0 && (
                <svg className="w-10 h-6" viewBox="0 0 40 24">
                  <ellipse cx="10" cy="18" rx="8" ry="6" fill="#15803d" />
                  <ellipse cx="20" cy="15" rx="10" ry="8" fill="#16a34a" />
                  <ellipse cx="30" cy="18" rx="8" ry="6" fill="#15803d" />
                  <ellipse cx="20" cy="10" rx="7" ry="5" fill="#22c55e" />
                </svg>
              )}
              {/* Rock */}
              {i % 3 === 0 && (
                <svg className="w-6 h-4" viewBox="0 0 24 16">
                  <ellipse cx="12" cy="12" rx="10" ry="8" fill="#78716c" />
                  <ellipse cx="8" cy="10" rx="4" ry="3" fill="#a8a29e" opacity="0.5" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400" />

      {/* Grass details */}
      <div
        className="absolute bottom-10 w-[300%] grass-layer"
        style={{ animationPlayState: animationState }}
      >
        <div className="flex gap-3">
          {[...Array(30)].map((_, i) => (
            <div key={`grass-${i}`} className="flex gap-1">
              <div className="w-1 h-3 bg-emerald-700 rounded-t-full transform -rotate-12" />
              <div className="w-1 h-4 bg-emerald-600 rounded-t-full" />
              <div className="w-1 h-3 bg-emerald-700 rounded-t-full transform rotate-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Foreground trees and flowers layer (faster - closer) */}
      <div
        className="absolute bottom-10 w-[300%] trees-layer"
        style={{ animationPlayState: animationState }}
      >
        <div className="flex gap-20 items-end">
          {[...Array(6)].map((_, i) => (
            <div key={`fg-${i}`} className="flex gap-8 items-end">
              {/* Tree */}
              <svg className="w-14 h-20" viewBox="0 0 50 70">
                {/* Trunk */}
                <rect x="20" y="45" width="10" height="20" fill="#8B5A2B" />
                {/* Foliage layers */}
                <ellipse cx="25" cy="35" rx="20" ry="15" fill="#22c55e" />
                <ellipse cx="18" cy="42" rx="12" ry="10" fill="#16a34a" />
                <ellipse cx="32" cy="42" rx="12" ry="10" fill="#16a34a" />
                <ellipse cx="25" cy="25" rx="15" ry="12" fill="#4ade80" />
              </svg>

              {/* Flowers and mushrooms */}
              <div className="flex gap-3 mb-2">
                <svg className="w-6 h-8" viewBox="0 0 24 32">
                  <line x1="12" y1="18" x2="12" y2="32" stroke="#16a34a" strokeWidth="2" />
                  <circle cx="12" cy="12" r="6" fill="#f472b6" />
                  <circle cx="12" cy="12" r="3" fill="#fbbf24" />
                </svg>
                {i % 2 === 0 && (
                  <svg className="w-5 h-6" viewBox="0 0 20 24">
                    <rect x="8" y="14" width="4" height="10" fill="#fef3c7" />
                    <ellipse cx="10" cy="10" rx="8" ry="6" fill="#dc2626" />
                    <circle cx="6" cy="9" r="1.5" fill="white" />
                    <circle cx="14" cy="9" r="1.5" fill="white" />
                  </svg>
                )}
                <svg className="w-5 h-7" viewBox="0 0 24 32">
                  <line x1="12" y1="18" x2="12" y2="32" stroke="#16a34a" strokeWidth="2" />
                  <circle cx="12" cy="12" r="5" fill="#c084fc" />
                  <circle cx="12" cy="12" r="2" fill="#fef08a" />
                </svg>
                <svg className="w-6 h-8" viewBox="0 0 24 32">
                  <line x1="12" y1="18" x2="12" y2="32" stroke="#16a34a" strokeWidth="2" />
                  <circle cx="12" cy="12" r="6" fill="#fb923c" />
                  <circle cx="12" cy="12" r="3" fill="#fbbf24" />
                </svg>
              </div>

              {/* Butterfly */}
              {i % 3 === 0 && (
                <div className="butterfly-float absolute -top-8 left-8">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <ellipse cx="8" cy="12" rx="5" ry="7" fill="#f472b6" opacity="0.7" />
                    <ellipse cx="16" cy="12" rx="5" ry="7" fill="#fb923c" opacity="0.7" />
                    <line x1="12" y1="8" x2="12" y2="16" stroke="#1e293b" strokeWidth="1.5" />
                    <circle cx="12" cy="10" r="1.5" fill="#1e293b" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fence posts */}
      <div
        className="absolute bottom-11 w-[300%] trees-layer"
        style={{ animationPlayState: animationState }}
      >
        <div className="flex gap-8 items-end">
          {[...Array(20)].map((_, i) => (
            <div key={`fence-${i}`} className="flex flex-col items-center">
              <div className="w-1 h-8 bg-amber-800/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Running character - minimalist modern athlete */}
      <div className="absolute inset-0 flex items-end justify-center pb-6">
        <div
          className="runner-bounce"
          style={{ animationPlayState: animationState }}
        >
          <svg className="w-16 h-20" viewBox="0 0 64 80">
            <defs>
              {/* Subtle gradients for depth */}
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
            <ellipse cx="32" cy="78" rx="12" ry="2.5" fill="rgba(0,0,0,0.2)" />

            {/* Back arm - clean and simple */}
            <g className="arm-back" style={{ transformOrigin: '30px 40px', animationPlayState: animationState }}>
              <line x1="30" y1="40" x2="40" y2="50" stroke="url(#skinTone)" strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* Back leg */}
            <g className="leg-back" style={{ transformOrigin: '34px 56px', animationPlayState: animationState }}>
              <line x1="34" y1="56" x2="44" y2="68" stroke="url(#shortsTone)" strokeWidth="6" strokeLinecap="round" />
              <line x1="44" y1="68" x2="48" y2="74" stroke="url(#skinTone)" strokeWidth="4" strokeLinecap="round" />
              {/* Shoe - minimal */}
              <ellipse cx="50" cy="75" rx="6" ry="3" fill="#059669" />
              <ellipse cx="49.5" cy="74.5" rx="4" ry="2" fill="#10b981" />
            </g>

            {/* Torso - clean athletic shape */}
            <ellipse cx="30" cy="46" rx="10" ry="13" fill="url(#shirtTone)" transform="rotate(10 30 46)" />
            
            {/* Running shorts - simple */}
            <ellipse cx="32" cy="56" rx="9" ry="6" fill="url(#shortsTone)" />

            {/* Front leg */}
            <g className="leg-front" style={{ transformOrigin: '30px 56px', animationPlayState: animationState }}>
              <line x1="30" y1="56" x2="20" y2="68" stroke="url(#shortsTone)" strokeWidth="6" strokeLinecap="round" />
              <line x1="20" y1="68" x2="16" y2="74" stroke="url(#skinTone)" strokeWidth="4" strokeLinecap="round" />
              {/* Shoe - minimal */}
              <ellipse cx="14" cy="75" rx="6" ry="3" fill="#059669" />
              <ellipse cx="14.5" cy="74.5" rx="4" ry="2" fill="#10b981" />
            </g>

            {/* Neck */}
            <line x1="26" y1="32" x2="24" y2="36" stroke="url(#skinTone)" strokeWidth="4" strokeLinecap="round" />

            {/* Head - simple silhouette */}
            <circle cx="24" cy="22" r="10" fill="url(#skinTone)" />
            
            {/* Minimal hair */}
            <path d="M 16 18 Q 20 12 28 14 Q 32 16 34 20" fill="#2d3748" />

            {/* Front arm - clean */}
            <g className="arm-front" style={{ transformOrigin: '28px 40px', animationPlayState: animationState }}>
              <line x1="28" y1="40" x2="18" y2="32" stroke="url(#skinTone)" strokeWidth="5" strokeLinecap="round" />
              {/* Fist - minimal */}
              <circle cx="17" cy="31" r="2.5" fill="#d4a574" />
            </g>
          </svg>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        .clouds-layer {
          animation: scroll-clouds 20s linear infinite;
        }

        .birds-layer {
          animation: scroll-birds 15s linear infinite;
        }

        .bg-trees-layer {
          animation: scroll-bg 8s linear infinite;
        }

        .trees-layer {
          animation: scroll-trees 4s linear infinite;
        }

        .grass-layer {
          animation: scroll-grass 2.5s linear infinite;
        }

        .runner-bounce {
          animation: run-bounce 0.25s ease-in-out infinite;
        }

        .butterfly-float {
          animation: butterfly-float 3s ease-in-out infinite;
        }

        .arm-front {
          animation: swing-arm-front 0.25s ease-in-out infinite;
        }

        .arm-back {
          animation: swing-arm-back 0.25s ease-in-out infinite;
        }

        .leg-front {
          animation: swing-leg-front 0.25s ease-in-out infinite;
        }

        .leg-back {
          animation: swing-leg-back 0.25s ease-in-out infinite;
        }

        @keyframes scroll-clouds {
          from { transform: translateX(0); }
          to { transform: translateX(-200px); }
        }

        @keyframes scroll-birds {
          from { transform: translateX(0); }
          to { transform: translateX(-300px); }
        }

        @keyframes butterfly-float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-8px) translateX(4px); }
          50% { transform: translateY(-4px) translateX(-4px); }
          75% { transform: translateY(-10px) translateX(2px); }
        }

        @keyframes scroll-bg {
          from { transform: translateX(0); }
          to { transform: translateX(-25%); }
        }

        @keyframes scroll-trees {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }

        @keyframes scroll-grass {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }

        @keyframes run-bounce {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
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
          0%, 100% { transform: rotate(40deg); }
          50% { transform: rotate(-40deg); }
        }

        @keyframes swing-leg-back {
          0%, 100% { transform: rotate(-40deg); }
          50% { transform: rotate(40deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .clouds-layer,
          .birds-layer,
          .bg-trees-layer,
          .trees-layer,
          .grass-layer,
          .runner-bounce,
          .butterfly-float,
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
