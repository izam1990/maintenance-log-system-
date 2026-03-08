import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt || localStorage.getItem('installPromptDismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-white border-2 border-slate-900 rounded-md shadow-lg p-4" data-testid="install-prompt">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-slate-900" />
          <h3 className="font-bold text-sm uppercase tracking-wide text-slate-900">Install App</h3>
        </div>
        <Button
          onClick={handleDismiss}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-zinc-100"
          data-testid="dismiss-install-button"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-sm text-zinc-600 mb-4">
        Install this app on your device for quick access and offline use.
      </p>
      <Button
        onClick={handleInstall}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-medium rounded-sm h-10 uppercase tracking-wide text-sm"
        data-testid="install-app-button"
      >
        <Download className="w-4 h-4 mr-2" />
        Install Now
      </Button>
    </div>
  );
};

export default InstallPrompt;
