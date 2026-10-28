'use client';

import { useEffect, useState } from 'react';

/* Home-header install button, next to Support Creator. The PWA is already
 * installed-capable (manifest + service worker); this button only
 * surfaces it — no popup, no nagging.
 *
 * - Android / desktop Chrome: the browser fires `beforeinstallprompt`
 *   when the app is installable. The button appears then, and tapping it
 *   opens the browser's own install dialog. Accepting installs; the
 *   `appinstalled` event hides the button.
 * - iOS Safari: there is no install prompt to fire, so the button is
 *   always shown and opens short instructions instead:
 *   Share -> Add to Home Screen. Nothing here can install
 *   programmatically on iOS.
 * - Already installed (standalone display mode): renders nothing. There
 *   is no "don't show again": the button is a quiet header link, like
 *   Support Creator, so it simply stays until the app is installed. */

function isIos() {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;
}

function isInstalled() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

export default function InstallButton() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isInstalled()) return;
    /* iOS never fires beforeinstallprompt, so its button shows on its
     * own; every other browser waits for the installable signal. */
    if (isIos()) {
      setHidden(false);
    }
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setPromptEvent(event);
      setHidden(false);
    };
    const onInstalled = () => {
      setHidden(true);
      setPromptEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const onClick = async () => {
    if (!promptEvent) {
      setShowHelp((open) => !open);
      return;
    }
    promptEvent.prompt();
    /* Either outcome clears the prompt: on dismissal the browser itself
     * holds back from firing the event again soon, so no extra hiding
     * is needed. */
    await promptEvent.userChoice;
    setPromptEvent(null);
  };

  if (hidden) return null;

  return <span className="install-wrap">
    <button className="support-link install-button" type="button" onClick={onClick}>Add to Home Screen</button>
    {showHelp && <span className="install-help" role="dialog" aria-label="How to add to your home screen">
      <strong>On iPhone or iPad:</strong>
      <span>1. Tap Share (the square with an arrow).<br />2. Tap Add to Home Screen.</span>
      <button className="install-help-close" type="button" onClick={() => setShowHelp(false)}>Got it</button>
    </span>}
  </span>;
}
