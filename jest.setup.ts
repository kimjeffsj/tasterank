import "@testing-library/jest-dom";

// Provide a no-op fetch stub for test environments that do not include fetch globally
if (typeof global.fetch === "undefined") {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true })) as jest.Mock;
}
