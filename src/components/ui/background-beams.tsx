'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const paths = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "m-369 -179c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-358 -169c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-347 -159c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-336 -149c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-325 -139c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-314 -129c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-303 -119c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-292 -109c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-281 -99c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-270 -89c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-259 -79c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-248 -69c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-237 -59c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-226 -49c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-215 -39c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-204 -29c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-193 -19c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-182 -9c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-171 1c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-160 11c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-149 21c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-138 31c0 0 68 405 532 532 464 127 532 532 532 532",
    "m-127 41c0 0 68 405 532 532 464 127 532 532 532 532",
  ];
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        className
      )}
    >
      <svg
        className="absolute pointer-events-none"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.3">
          {paths.map((path, index) => (
            <path
              key={index}
              d={path}
              stroke={`url(#paint${index}_linear)`}
              strokeOpacity="0.4"
              strokeWidth="0.5"
            />
          ))}
        </g>
        <defs>
          {paths.map((_, index) => (
            <linearGradient
              key={index}
              id={`paint${index}_linear`}
              x1="193.651"
              y1="101.118"
              x2="193.651"
              y2="200.118"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop offset="1" stopColor="#18CCFC" />
            </linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
};
