import { useState, useEffect } from 'react';

// True when the viewport is narrow (phone / small tablet). Components branch
// their inline layout styles on this — the app is inline-styled, so a JS media
// query is cleaner than fighting CSS specificity with !important.
export function useIsMobile(maxWidth = 820) {
  const query = `(max-width: ${maxWidth}px)`;
  const read = () =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false;

  const [mobile, setMobile] = useState(read);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return mobile;
}
