import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OfflineBanner = () => {
  const { isOnline, setIsOnline, syncQueue, isSyncing, syncOfflineChanges } = useApp();

  return (
    <div className="w-full">
      {!isOnline ? (
        <div className="bg-amber-500 text-white px-3 py-2 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <WifiOff size={16} className="animate-pulse" />
            <span>
              Offline Mode — Changes saved locally ({syncQueue.length} queued)
            </span>
          </div>
          <button
            onClick={() => setIsOnline(true)}
            className="text-[11px] underline bg-amber-600 px-2 py-1 rounded hover:bg-amber-700"
          >
            Simulate Online
          </button>
        </div>
      ) : syncQueue.length > 0 ? (
        <div className="bg-blue-600 text-white px-3 py-2 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
            <span>
              {isSyncing
                ? `Syncing ${syncQueue.length} offline changes...`
                : `${syncQueue.length} changes ready to sync`}
            </span>
          </div>
          <button
            onClick={syncOfflineChanges}
            disabled={isSyncing}
            className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded text-[11px] font-semibold"
          >
            Sync Now
          </button>
        </div>
      ) : null}
    </div>
  );
};
