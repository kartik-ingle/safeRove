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
        // Clear any previous content (if navigating between routes)
        containerRef.current.innerHTML = "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // Instantiate the widget
        // @ts-expect-error - google translate types not available
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,fr,es,de,ar,zh-CN,ru,pt,it",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
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


