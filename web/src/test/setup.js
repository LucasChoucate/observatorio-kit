import '@testing-library/jest-dom/vitest';

// O jsdom não implementa ResizeObserver, usado pelo ResponsiveContainer do Recharts.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
