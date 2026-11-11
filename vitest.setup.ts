import '@testing-library/jest-dom/vitest';

// jsdom has no media queries and no layout: Mantine asks for both.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// React listens for `animationend` under that name only where the browser has animation events.
globalThis.AnimationEvent ??= class extends Event {} as unknown as typeof AnimationEvent;
