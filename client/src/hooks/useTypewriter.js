import { useState, useEffect } from "react";

export default function useTypewriter(roles, loading) {
  const [typedText, setTypedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!roles || roles.length === 0 || loading) return;
    const currentRole = roles[currentIndex];
    if (!currentRole || typeof currentRole !== "string") return;
    const typeSpeed = isDeleting ? 50 : 100;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentRole.length) {
          setTypedText(currentRole.slice(0, typedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(currentRole.slice(0, typedText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % roles.length);
        }
      }
    }, typeSpeed);
    return () => clearTimeout(timeout);
  }, [typedText, currentIndex, isDeleting, roles, loading]);

  return typedText;
}
