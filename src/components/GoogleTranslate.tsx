import { useEffect, useRef } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

const GoogleTranslate = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Apply styles to the injected Google select once available
  const styleSelect = () => {
    try {
      const root = containerRef.current;
      if (!root) return;
      const select: HTMLSelectElement | null = root.querySelector('select.goog-te-combo');
      if (!select) return;

      // Add a placeholder option if not present
      const hasPlaceholder = Array.from(select.options).some(opt => opt.value === '' && opt.textContent === 'Select language');
      if (!hasPlaceholder) {
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Select language';
        placeholder.disabled = true;
        placeholder.selected = !select.value; // show placeholder if nothing selected
        select.insertBefore(placeholder, select.firstChild);
      }

      // Inline styles to avoid CSS scoping issues
      select.style.border = '1px solid var(--glass-border, rgba(148, 163, 184, 0.3))';
      select.style.background = 'rgba(255,255,255,0.6)';
      select.style.backdropFilter = 'blur(8px)';
      select.style.borderRadius = '9999px';
      select.style.padding = '6px 28px 6px 12px';
      select.style.height = '36px';
      select.style.lineHeight = '24px';
      select.style.fontSize = '14px';
      select.style.color = 'var(--foreground, #0f172a)';
      select.style.cursor = 'pointer';
      select.style.appearance = 'none';
      select.style.setProperty('-webkit-appearance', 'none');
      select.style.setProperty('-moz-appearance', 'none');

      // Wrap relative container to show a chevron via CSS pseudo (fallback: none)
      const parent = select.parentElement as HTMLElement | null;
      if (parent) {
        parent.style.position = 'relative';
      }

      // Hide default Google icon/text wrappers for a cleaner look
      const imgs = root.querySelectorAll('img');
      imgs.forEach(img => {
        const alt = (img.getAttribute('alt') || '').toLowerCase();
        if (alt.includes('google')) {
          (img as HTMLImageElement).style.display = 'none';
        }
      });
    } catch {
      // no-op
    }
  };

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
            includedLanguages: "en,hi,bn,te,mr,ta,ur,gu,kn,or,pa,ml,as",
            layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
          },
          containerRef.current
        );

        // Style once now and again after mutations, as Google injects nodes async
        styleSelect();

        const mo = new MutationObserver(() => styleSelect());
        mo.observe(containerRef.current, { childList: true, subtree: true });
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


