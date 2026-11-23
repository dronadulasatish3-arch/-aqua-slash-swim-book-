import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export function AppUpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [initialEtag, setInitialEtag] = useState<string | null>(null);
  const [initialModified, setInitialModified] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    let isMounted = true;

    // Check server headers for changes
    const checkForUpdates = async (isInitial = false) => {
      try {
        const url = window.location.pathname + '?_v=' + Date.now();
        const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
        if (!res.ok) return;

        const currentEtag = res.headers.get('etag');
        const currentModified = res.headers.get('last-modified');

        if (isInitial) {
          if (isMounted) {
            setInitialEtag(currentEtag);
            setInitialModified(currentModified);
          }
          return;
        }

        // Compare with initial load headers
        const etagChanged = initialEtag && currentEtag && initialEtag !== currentEtag;
        const modifiedChanged = initialModified && currentModified && initialModified !== currentModified;

        if (etagChanged || modifiedChanged) {
          if (isMounted) {
            setUpdateAvailable(true);
          }
        }
      } catch {
        /* silent on network offline */
      }
    };

    // Grab initial headers after 3 seconds
    const initialTimer = setTimeout(() => {
      checkForUpdates(true);
    }, 3000);

    // Periodically poll every 4 minutes while app is open
    const pollInterval = setInterval(() => {
      checkForUpdates(false);
    }, 240000);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(pollInterval);
    };
  }, [initialEtag, initialModified]);

  const handleUpdateNow = () => {
    setIsUpdating(true);
    try {
      // Clear session storage & reload
      sessionStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  if (!updateAvailable || dismissed) return null;

  return (
    <aside aria-label="Update notification" className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md animate-bounce-subtle">
      <div className="flex items-center justify-between gap-3 rounded-2xl border-3 border-black bg-yellow-300 p-3 sm:px-4 text-black shadow-[4px_4px_0_#000]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black text-yellow-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-bangers text-sm sm:text-base tracking-wide leading-tight truncate">
              New Update Available!
            </p>
            <p className="font-comic text-[11px] text-slate-800 leading-tight">
              A newer version of Aqua Slash is ready.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleUpdateNow}
            disabled={isUpdating}
            className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-black px-3 py-1 font-bangers text-xs sm:text-sm tracking-wider text-yellow-300 shadow-[2px_2px_0_#000] hover:bg-slate-800 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'RELOADING...' : 'UPDATE NOW'}</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 text-slate-700 hover:text-black cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
