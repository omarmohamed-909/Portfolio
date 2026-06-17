import { useState, useRef, useCallback, useEffect } from "react";

const useReveal = (threshold = 0.12) => {
  const [isVisible, setIsVisible] = useState(true);
  const observerRef = useRef(null);

  const callbackRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setIsVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(node); }
      },
      { threshold }
    );
    observer.observe(node);
    observerRef.current = observer;
  }, [threshold]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [callbackRef, isVisible];
};

export default useReveal;
