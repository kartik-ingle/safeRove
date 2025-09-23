import { useEffect, useRef } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

const GoogleTranslate = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // If script already loaded, re-init into our container
    const init = () => {
      try {
        if (!window.google || !window.google.translate || !containerRef.current) return;
        // Ensure default language is English on first load
        if (typeof document !== 'undefined') {
          const hasCookie = document.cookie.split('; ').some(c => c.startsWith('googtrans='));
          if (!hasCookie) {
            const expire = new Date();
            expire.setFullYear(expire.getFullYear() + 1);
            const expires = `expires=${expire.toUTCString()}`;
            const langPair = '/en/en';
            try { document.cookie = `googtrans=${langPair};path=/;${expires}`; } catch {}
            try { document.cookie = `googtrans=${langPair};domain=.${window.location.hostname};path=/;${expires}`; } catch {}
          }
        }
        // Clear any previous content (if navigating between routes)
        containerRef.current.innerHTML = "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // Instantiate the widget
    
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,bn,te,mr,ta,ur,gu,kn,or,pa,ml,as", // English + 12 Indian languages
            layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
          },
          containerRef.current
        );
      } catch {
        // no-op
      }
    };

    // Provide global callback for Google script
    window.googleTranslateElementInit = init;

    const existing = document.querySelector("script[data-google-translate]") as HTMLScriptElement | null;
    if (!existing) {
      const s = document.createElement("script");
      s.type = "text/javascript";
      s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      s.defer = true;
      s.setAttribute("data-google-translate", "true");
      s.onload = () => init();
      document.body.appendChild(s);
    } else {
      // If script present (route change), attempt init
      init();
    }

    return () => {
      // keep script; widget will be re-initialized when navigating
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="google_translate_element"
      style={{ display: "inline-block" }}
    />
  );
};

export default GoogleTranslate;


