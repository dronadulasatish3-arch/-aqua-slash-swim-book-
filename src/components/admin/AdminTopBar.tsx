import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  ShieldCheck,
  Edit3,
  Sliders,
  Download,
  RotateCcw,
  Lock,
} from 'lucide-react';

export const AdminTopBar: React.FC = () => {
  const {
    isAdmin,
    isEditMode,
    openLoginModal,
    logout,
    toggleEditMode,
    setAdminDrawerOpen,
    exportStoryJson,
    resetStoryToDefaults,
  } = useAdmin();

  // When locked, do not render any top admin bar at all (keeps reader completely clean)
  if (!isAdmin) {
    return null;
  }

  // When unlocked, show full Admin Toolbar
  return (
    <div className="bg-gradient-to-r from-purple-950 via-slate-950 to-indigo-950 px-3 py-1.5 text-white border-b-2 border-black sticky top-0 z-50 shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-xs">
        {/* Admin Identity */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded bg-yellow-400 px-2 py-0.5 font-bangers text-black text-xs tracking-wider border border-black shadow-[1px_1px_0_#000]">
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMIN: SATISH DRONADULA
          </div>
          <span className="hidden font-mono text-[11px] text-slate-300 sm:inline">
            dronadulasatish3@gmail.com
          </span>
        </div>

        {/* Edit Mode Toggle & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Visual Edit Mode Toggle */}
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-1 font-bangers text-xs tracking-wider transition cursor-pointer shadow-[2px_2px_0_#000] ${
              isEditMode
                ? 'bg-rose-500 text-white border-black animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditMode ? 'EDIT MODE: ON (CLICK ANY TEXT / IMAGE)' : 'ENABLE VISUAL EDITING'}
          </button>

          {/* Admin Control Center Button */}
          <button
            onClick={() => setAdminDrawerOpen(true)}
            className="flex items-center gap-1 rounded-lg border-2 border-black bg-cyan-400 px-2.5 py-1 font-bangers text-xs tracking-wider text-black shadow-[2px_2px_0_#000] hover:bg-cyan-300 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" /> STORY CMS
          </button>

          {/* Export JSON Backup */}
          <button
            onClick={exportStoryJson}
            title="Download JSON Backup"
            className="flex items-center gap-1 rounded-lg border-2 border-black bg-slate-800 px-2 py-1 font-bangers text-xs tracking-wider text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <Download className="w-3 h-3" /> BACKUP
          </button>

          {/* Reset All to Defaults */}
          <button
            onClick={resetStoryToDefaults}
            title="Reset Story to Default"
            className="flex items-center gap-1 rounded-lg border-2 border-black bg-slate-800 px-2 py-1 font-bangers text-xs tracking-wider text-amber-300 hover:bg-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> RESET
          </button>

          {/* Lock / Logout */}
          <button
            onClick={logout}
            title="Lock admin controls and return to reader mode"
            className="flex items-center gap-1.5 rounded-lg border-2 border-black bg-rose-600 px-2.5 py-1 font-bangers text-xs tracking-wider text-white hover:bg-rose-500 cursor-pointer shadow-[2px_2px_0_#000]"
          >
            <Lock className="w-3 h-3" /> LOCK & EXIT 🔒
          </button>
        </div>
      </div>
    </div>
  );
};
