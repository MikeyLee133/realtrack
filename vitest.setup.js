import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto'; // gives fileStore a working IndexedDB in tests

// jsdom doesn't implement these — stub them so components don't throw.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  });
}
Element.prototype.scrollIntoView = function () {};
if (!URL.createObjectURL) URL.createObjectURL = () => 'blob:mock';
if (!URL.revokeObjectURL) URL.revokeObjectURL = () => {};

// A clean slate between tests.
afterEach(() => {
  localStorage.clear();
});
