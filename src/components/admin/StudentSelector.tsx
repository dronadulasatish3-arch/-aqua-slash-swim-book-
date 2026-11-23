import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getRegisteredStudents, syncStudentsFromBackend, type StudentRecord } from '../../data/studentRegistry';
import { Search, CheckSquare, Square, X, UserCheck, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';

interface StudentSelectorProps {
  selectedStudentIds: string[];
  onChange: (ids: string[], names: string[]) => void;
}

export const StudentSelector: React.FC<StudentSelectorProps> = ({
  selectedStudentIds,
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allStudents, setAllStudents] = useState<StudentRecord[]>(() => getRegisteredStudents());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncSuccess, setLastSyncSuccess] = useState<boolean>(false);

  // Sync latest registered students from Google Sheets backend
  const refreshStudents = useCallback(async () => {
    setIsSyncing(true);
    try {
      const fresh = await syncStudentsFromBackend();
      if (fresh && fresh.length > 0) {
        setAllStudents(fresh);
        setLastSyncSuccess(true);
        setTimeout(() => setLastSyncSuccess(false), 3000);
      }
    } catch (e) {
      console.warn('Failed to sync students from Google Sheets:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Fetch immediately on mount
  useEffect(() => {
    refreshStudents();
  }, [refreshStudents]);

  // Filter students by search term (name, studentId, mobile, email, or parent)
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return allStudents;
    const q = searchTerm.trim().toLowerCase();
    return allStudents.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        (s.mobile && s.mobile.includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.parentName && s.parentName.toLowerCase().includes(q))
    );
  }, [allStudents, searchTerm]);

  // Selected student objects
  const selectedStudents = useMemo(() => {
    const idSet = new Set(selectedStudentIds);
    return allStudents.filter((s) => idSet.has(s.studentId));
  }, [allStudents, selectedStudentIds]);

  const toggleStudent = (student: StudentRecord) => {
    const exists = selectedStudentIds.includes(student.studentId);
    let nextIds: string[];
    let nextNames: string[];

    if (exists) {
      nextIds = selectedStudentIds.filter((id) => id !== student.studentId);
      nextNames = selectedStudents
        .filter((s) => s.studentId !== student.studentId)
        .map((s) => s.studentName);
    } else {
      nextIds = [...selectedStudentIds, student.studentId];
      nextNames = [...selectedStudents.map((s) => s.studentName), student.studentName];
    }
    onChange(nextIds, nextNames);
  };

  const handleSelectAll = () => {
    const allIds = filteredStudents.map((s) => s.studentId);
    const allNames = filteredStudents.map((s) => s.studentName);
    onChange(allIds, allNames);
  };

  const handleClear = () => {
    onChange([], []);
  };

  return (
    <div className="space-y-2 rounded-2xl border-2 border-slate-700 bg-slate-950 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span>Select Private Students ({selectedStudentIds.length} Selected)</span>
        </label>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={refreshStudents}
            disabled={isSyncing}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer disabled:opacity-50"
            title="Sync latest students from Google Sheets"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : lastSyncSuccess ? 'Synced Sheet ✓' : 'Sync Sheet'}</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sky-400 hover:text-sky-300 hover:underline font-semibold cursor-pointer"
          >
            Select All
          </button>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-rose-400 hover:text-rose-300 hover:underline font-semibold cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Selected Student Badges */}
      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-900/90 p-2 border border-slate-800">
          {selectedStudents.map((s) => (
            <span
              key={s.studentId}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/20 px-2 py-1 text-[11px] font-bold text-amber-300 border border-amber-400/30"
            >
              <span>{s.studentName}</span>
              <span className="font-mono text-[10px] text-amber-200">({s.studentId})</span>
              <button
                type="button"
                onClick={() => toggleStudent(s)}
                className="rounded-full p-0.5 hover:bg-amber-400 hover:text-black cursor-pointer text-amber-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by student name or Student ID (e.g. Satish, AS-1576, Jishnu)..."
          className="w-full rounded-xl border border-slate-700 bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Scrollable Student List */}
      <div className="max-h-52 overflow-y-auto space-y-1.5 rounded-xl border border-slate-800 bg-slate-900/50 p-2 text-xs">
        {filteredStudents.length === 0 ? (
          <div className="py-4 text-center text-slate-400">
            No matching registered students found for &quot;{searchTerm}&quot;.
          </div>
        ) : (
          filteredStudents.map((s) => {
            const isChecked = selectedStudentIds.includes(s.studentId);
            return (
              <div
                key={s.studentId}
                onClick={() => toggleStudent(s)}
                className={`flex items-center justify-between rounded-xl px-2.5 py-2 transition cursor-pointer border ${
                  isChecked
                    ? 'border-amber-400/50 bg-amber-500/15 text-white'
                    : 'border-transparent bg-slate-900 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500 shrink-0" />
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold truncate text-white text-xs">{s.studentName}</span>
                      <span className="rounded bg-sky-950/80 px-1.5 py-0.2 font-mono text-[10px] font-bold text-sky-300 border border-sky-400/30">
                        {s.studentId}
                      </span>
                      {s.role === 'ADMIN' && (
                        <span className="flex items-center gap-0.5 rounded bg-amber-400/20 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-300 border border-amber-400/30">
                          <Shield className="w-2.5 h-2.5" /> Coach / Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 truncate">
                      {s.mobile && <span>📱 {s.mobile}</span>}
                      {s.email && <span>✉ {s.email}</span>}
                      {s.parentName && <span>Parent: {s.parentName}</span>}
                    </div>
                  </div>
                </div>

                <span className="rounded-lg bg-slate-800/90 px-2 py-0.5 font-bold text-[10px] text-sky-200 border border-sky-500/30 shrink-0 ml-2">
                  {s.currentLevel || 'Level 1'}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-amber-200/80 leading-tight pt-1">
        <span>
          🔒 <strong>Private Access Control:</strong> Only selected students and their authorized parent accounts can watch this video.
        </span>
        <span className="text-slate-400 text-[10px] shrink-0 ml-2">
          {allStudents.length} registered
        </span>
      </div>
    </div>
  );
};
