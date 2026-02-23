"use client";

import { useEffect, useState } from "react";

const IN_APP_PATTERNS: Record<string, RegExp> = {
  LINE: /Line\//i,
  Facebook: /FBAN|FBAV/i,
  Instagram: /Instagram/i,
  KakaoTalk: /KAKAOTALK/i,
};

export function detectInAppBrowser(ua: string): string | null {
  for (const [name, pattern] of Object.entries(IN_APP_PATTERNS)) {
    if (pattern.test(ua)) return name;
  }
  return null;
}

export function InAppBrowserBanner() {
  const [appName, setAppName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setAppName(detectInAppBrowser(navigator.userAgent));
  }, []);

  if (!appName || dismissed) return null;

  const isAndroid = /Android/i.test(navigator.userAgent);
  const url = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silent fail
    }
  };

  const handleOpenInChrome = () => {
    window.location.href = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
  };

  return (
    <div
      role="alert"
      className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-amber-400 bg-amber-50 p-4 shadow-lg dark:border-amber-600 dark:bg-amber-950"
    >
      <div className="mx-auto max-w-lg">
        <div className="flex items-start gap-3">
          <span className="material-icons-round mt-0.5 text-2xl text-amber-600">
            warning
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Google sign-in isn&apos;t available in {appName}
            </p>
            {isAndroid ? (
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                Open this page in Chrome to sign in and add ratings.
              </p>
            ) : (
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                Tap <strong>···</strong> →{" "}
                <strong>Open in browser</strong>, or copy the link to open in
                Safari.
              </p>
            )}
            <div className="mt-3 flex gap-2">
              {isAndroid && (
                <button
                  onClick={handleOpenInChrome}
                  className="flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-transform active:scale-95"
                >
                  <span className="material-icons-round text-sm">
                    open_in_new
                  </span>
                  Open in Chrome
                </button>
              )}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-full border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition-transform active:scale-95 dark:bg-amber-900 dark:text-amber-200"
              >
                <span className="material-icons-round text-sm">
                  {copied ? "check" : "content_copy"}
                </span>
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="text-amber-600 dark:text-amber-400"
          >
            <span className="material-icons-round text-xl">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
