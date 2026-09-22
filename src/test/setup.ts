import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

afterEach(() => {
    cleanup();
});

// Mock matchMedia for JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock HTMLCanvasElement.prototype.getContext
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: () => {
        return {
            fillRect: vi.fn(),
            clearRect: vi.fn(),
            getImageData: vi.fn(() => ({
                data: new Array(4),
            })),
            putImageData: vi.fn(),
            createImageData: vi.fn(() => []),
            setTransform: vi.fn(),
            drawImage: vi.fn(),
            save: vi.fn(),
            fillText: vi.fn(),
            restore: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            stroke: vi.fn(),
            translate: vi.fn(),
            scale: vi.fn(),
            rotate: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            measureText: vi.fn(() => ({ width: 0 })),
            transform: vi.fn(),
            rect: vi.fn(),
            clip: vi.fn(),
        };
    },
});

// Mock ResizeObserver
// Constructible Mock for ResizeObserver
const ResizeObserverMock = vi.fn(function() {
    return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    };
});
global.ResizeObserver = ResizeObserverMock as any;

// Constructible Mock for IntersectionObserver
const IntersectionObserverMock = vi.fn(function() {
    return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    };
});
global.IntersectionObserver = IntersectionObserverMock as any;
