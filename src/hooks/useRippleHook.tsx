// A reusable React hook that adds a ripple effect to any button-like component using MUI v7 styling.

import { useRef, useCallback } from 'react';

/**
 * useRipple
 * A hook that provides a ref and onPointerDown handler to attach a ripple effect to a button.
 *
 * Usage:
 * const { ref, onPointerDown } = useRipple();
 * return <button ref={ref} onPointerDown={onPointerDown}>Click me</button>;
 */
let stylesInjected = false;
export function useRipple() {
  const ref = useRef<HTMLButtonElement | null>(null);

  const createRipple = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    // Inject global styles once
    if (!stylesInjected) {
      const styleTag = document.createElement('style');
      styleTag.id = 'ripple-styles';
      styleTag.textContent = `
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          background-color: rgb(180, 180, 180)';
          pointer-events: none;
          animation: ripple 600ms linear;
        }
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(styleTag);
      stylesInjected = true;
    }

    const button = ref.current;
    if (!button) return;

    // ensure container can position and clip the ripple
    const computed = getComputedStyle(button);
    if (computed.position === 'static') {
      button.style.position = 'relative';
    }
    button.style.overflow = 'hidden';

    // Create the ripple element
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    // Apply styles to the ripple
    Object.assign(circle.style, {
      width: `${diameter}px`,
      height: `${diameter}px`,
      left: `${event.clientX - button.getBoundingClientRect().left - radius}px`,
      top: `${event.clientY - button.getBoundingClientRect().top - radius}px`,
      position: 'absolute',
      borderRadius: '50%',
      transform: 'scale(0)',
      backgroundColor: 'rgb(180, 180, 180)',
      pointerEvents: 'none',
    });

    // Apply animation via CSS class
    circle.classList.add('ripple');

    // Clean up after animation
    circle.addEventListener('animationend', () => circle.remove());

    // Append the ripple to the button
    button.appendChild(circle);
  }, []);

  return {
    ref,
    onPointerDown: createRipple,
  };
}
