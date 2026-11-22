import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Page, Panel } from '../comic/types';
import { PAGES as DEFAULT_VECTOR_PAGES, CHAPTERS as DEFAULT_VECTOR_CHAPTERS } from '../comic/story';
import { COMIC_PAGES as DEFAULT_ILLUSTRATED_PAGES, ComicPageData, ComicPanelData } from '../data/comicStoryData';
import { comicAudio } from '../utils/comicAudio';

export interface CoverData {
  badge: string;
  titleTop: string;
  titleHighlight: string;
  subtitle: string;
  slogan: string;
  bgImage?: string;
}

const DEFAULT_COVER: CoverData = {
  badge: 'A TRUE CHILDHOOD JOURNEY',
  titleTop: 'The Hand',
  titleHighlight: 'in the Water',
  subtitle: 'A Journey That Began With Water • Memoir of a Swimmer',
  slogan: 'CUT THROUGH FEAR OF WATER. ONE BOY WHO FOLLOWED THE RIVER.',
};

export type EditTarget =
  | { type: 'illustrated-panel'; pageNumber: number; panel: ComicPanelData }
  | { type: 'illustrated-page'; pageNumber: number; page: ComicPageData }
  | { type: 'vector-panel'; pageIndex: number; panelIndex: number; panel: Panel }
  | { type: 'vector-chapter'; chapterNumber: number; title: string }
  | { type: 'vector-page'; pageIndex: number; page: Page }
  | { type: 'vector-cover' };

interface AdminUser {
  email: string;
  name: string;
  role: string;
}

interface AdminContextType {
  isAdmin: boolean;
  isEditMode: boolean;
  adminUser: AdminUser | null;
  loginModalOpen: boolean;
  activeEditTarget: EditTarget | null;
  adminDrawerOpen: boolean;

  // Comic Story 1: Illustrated Edition (15 pages)
  illustratedPages: ComicPageData[];

  // Comic Story 2: Vector Strip Edition (44 pages)
  vectorPages: Page[];
  vectorChapters: { n: number; title: string }[];
  vectorCover: CoverData;

  // Auth actions
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  toggleEditMode: () => void;
  setAdminDrawerOpen: (open: boolean) => void;

  // Editing actions
  openEditor: (target: EditTarget) => void;
  closeEditor: () => void;

  // Illustrated Story Actions
  updateIllustratedPanel: (pageNumber: number, panelNumber: number, updates: Partial<ComicPanelData>) => void;
  updateIllustratedPage: (pageNumber: number, updates: Partial<ComicPageData>) => void;

  // Vector Story Actions
  updateVectorPanel: (pageIndex: number, panelIndex: number, updates: Partial<Panel>) => void;
  updateVectorPage: (pageIndex: number, updates: Partial<Page>) => void;
  updateVectorChapter: (chapterNumber: number, title: string) => void;
  updateVectorCover: (updates: Partial<CoverData>) => void;
  addVectorPanel: (pageIndex: number) => void;
  deleteVectorPanel: (pageIndex: number, panelIndex: number) => void;
  addVectorPage: (afterIndex: number) => void;
  deleteVectorPage: (pageIndex: number) => void;

  // Persistence
  resetBothStoriesToDefaults: () => void;
  exportAllStoriesJson: () => void;
  importAllStoriesJson: (jsonStr: string) => boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always start LOCKED by default! Must enter password to unlock.
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [activeEditTarget, setActiveEditTarget] = useState<EditTarget | null>(null);
  const [adminDrawerOpen, setAdminDrawerOpen] = useState<boolean>(false);

  // Clean up any old auto-login flags from localStorage so it never opens on its own
  useEffect(() => {
    localStorage.removeItem('aqua_slash_admin_logged_in');
    localStorage.removeItem('aqua_slash_edit_mode');
  }, []);

  // Comic Story 1: Illustrated Edition
  const [illustratedPages, setIllustratedPages] = useState<ComicPageData[]>(() => {
    const saved = localStorage.getItem('aqua_illustrated_pages_v3');
    return saved ? JSON.parse(saved) : DEFAULT_ILLUSTRATED_PAGES;
  });

  // Comic Story 2: Vector Strip Edition
  const [vectorPages, setVectorPages] = useState<Page[]>(() => {
    const saved = localStorage.getItem('aqua_vector_pages_v3');
    return saved ? JSON.parse(saved) : DEFAULT_VECTOR_PAGES;
  });

  const [vectorChapters, setVectorChapters] = useState<{ n: number; title: string }[]>(() => {
    const saved = localStorage.getItem('aqua_vector_chapters_v3');
    return saved ? JSON.parse(saved) : DEFAULT_VECTOR_CHAPTERS;
  });

  const [vectorCover, setVectorCover] = useState<CoverData>(() => {
    const saved = localStorage.getItem('aqua_vector_cover_v3');
    return saved ? JSON.parse(saved) : DEFAULT_COVER;
  });

  // LocalStorage Sync
  useEffect(() => {
    localStorage.setItem('aqua_illustrated_pages_v3', JSON.stringify(illustratedPages));
  }, [illustratedPages]);

  useEffect(() => {
    localStorage.setItem('aqua_vector_pages_v3', JSON.stringify(vectorPages));
  }, [vectorPages]);

  useEffect(() => {
    localStorage.setItem('aqua_vector_chapters_v3', JSON.stringify(vectorChapters));
  }, [vectorChapters]);

  useEffect(() => {
    localStorage.setItem('aqua_vector_cover_v3', JSON.stringify(vectorCover));
  }, [vectorCover]);

  const login = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (
      cleanEmail === 'dronadulasatish3@gmail.com' &&
      (cleanPass === 'satish 630525' ||
        cleanPass.toLowerCase() === 'satish 630525' ||
        cleanPass === 'satish630525' ||
        cleanPass.toLowerCase() === 'satish630525')
    ) {
      const user: AdminUser = {
        email: 'dronadulasatish3@gmail.com',
        name: 'Satish Dronadula',
        role: 'Author & Master Admin',
      };
      setIsAdmin(true);
      setIsEditMode(true);
      setAdminUser(user);
      setLoginModalOpen(false);
      comicAudio.playSuccessChime();
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setIsEditMode(false);
    setAdminUser(null);
    comicAudio.playPageFlip();
  };

  const toggleEditMode = () => {
    if (!isAdmin) {
      return;
    }
    const next = !isEditMode;
    setIsEditMode(next);
    comicAudio.playWaterDrop();
  };

  const openEditor = (target: EditTarget) => {
    if (!isAdmin) {
      return;
    }
    setActiveEditTarget(target);
    comicAudio.playPageFlip();
  };

  const closeEditor = () => {
    setActiveEditTarget(null);
  };

  // Illustrated Story Updates
  const updateIllustratedPanel = (
    pageNumber: number,
    panelNumber: number,
    updates: Partial<ComicPanelData>
  ) => {
    setIllustratedPages((prev) =>
      prev.map((page) => {
        if (page.pageNumber !== pageNumber) return page;
        const newPanels = [...page.panels] as [
          ComicPanelData,
          ComicPanelData,
          ComicPanelData,
          ComicPanelData
        ];
        const pIdx = panelNumber - 1;
        if (pIdx >= 0 && pIdx < newPanels.length) {
          const merged = { ...newPanels[pIdx], ...updates };
          if ('customImage' in updates && !updates.customImage) {
            delete (merged as any).customImage;
          }
          newPanels[pIdx] = merged;
        }
        return { ...page, panels: newPanels };
      })
    );
    comicAudio.playSuccessChime();
  };

  const updateIllustratedPage = (pageNumber: number, updates: Partial<ComicPageData>) => {
    setIllustratedPages((prev) =>
      prev.map((page) => (page.pageNumber === pageNumber ? { ...page, ...updates } : page))
    );
    comicAudio.playSuccessChime();
  };

  // Vector Story Updates
  const updateVectorPanel = (pageIndex: number, panelIndex: number, updates: Partial<Panel>) => {
    setVectorPages((prev) => {
      const next = [...prev];
      const page = next[pageIndex];
      if (!page) return prev;
      const nextPanels = [...page.panels];
      const merged = { ...nextPanels[panelIndex], ...updates };
      if ('customImg' in updates && !updates.customImg) {
        delete merged.customImg;
      }
      nextPanels[panelIndex] = merged;
      next[pageIndex] = { ...page, panels: nextPanels };
      return next;
    });
    comicAudio.playSuccessChime();
  };

  const updateVectorPage = (pageIndex: number, updates: Partial<Page>) => {
    setVectorPages((prev) => {
      const next = [...prev];
      if (!next[pageIndex]) return prev;
      next[pageIndex] = { ...next[pageIndex], ...updates };
      return next;
    });
    comicAudio.playSuccessChime();
  };

  const updateVectorChapter = (chapterNumber: number, title: string) => {
    setVectorChapters((prev) =>
      prev.map((c) => (c.n === chapterNumber ? { ...c, title } : c))
    );
    comicAudio.playSuccessChime();
  };

  const updateVectorCover = (updates: Partial<CoverData>) => {
    setVectorCover((prev) => ({ ...prev, ...updates }));
    comicAudio.playSuccessChime();
  };

  const addVectorPanel = (pageIndex: number) => {
    setVectorPages((prev) => {
      const next = [...prev];
      const page = next[pageIndex];
      if (!page) return prev;
      next[pageIndex] = {
        ...page,
        panels: [
          ...page.panels,
          {
            cap: 'Enter your new story text here...',
            tag: 'NEW SCENE',
            bg: 'road',
            sky: 'day',
          },
        ],
      };
      return next;
    });
    comicAudio.playSuccessChime();
  };

  const deleteVectorPanel = (pageIndex: number, panelIndex: number) => {
    setVectorPages((prev) => {
      const next = [...prev];
      const page = next[pageIndex];
      if (!page || page.panels.length <= 1) {
        alert('Each page must have at least one panel.');
        return prev;
      }
      next[pageIndex] = {
        ...page,
        panels: page.panels.filter((_, idx) => idx !== panelIndex),
      };
      return next;
    });
    comicAudio.playWaterDrop();
  };

  const addVectorPage = (afterIndex: number) => {
    setVectorPages((prev) => {
      const next = [...prev];
      const prevCh = next[afterIndex]?.ch || 1;
      next.splice(afterIndex + 1, 0, {
        ch: prevCh,
        sub: 'New Story Page',
        panels: [
          {
            cap: 'New panel description...',
            tag: 'NEW STORY STEP',
            bg: 'room',
            sky: 'day',
          },
        ],
      });
      return next;
    });
    comicAudio.playSuccessChime();
  };

  const deleteVectorPage = (pageIndex: number) => {
    if (vectorPages.length <= 1) {
      alert('Cannot delete the only page in the story.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete Page ${pageIndex + 1}?`)) {
      setVectorPages((prev) => prev.filter((_, idx) => idx !== pageIndex));
      comicAudio.playWaterDrop();
    }
  };

  const resetBothStoriesToDefaults = () => {
    if (window.confirm('Reset both Comic Story 1 and Comic Story 2 back to original publication?')) {
      setIllustratedPages(DEFAULT_ILLUSTRATED_PAGES);
      setVectorPages(DEFAULT_VECTOR_PAGES);
      setVectorChapters(DEFAULT_VECTOR_CHAPTERS);
      setVectorCover(DEFAULT_COVER);
      localStorage.removeItem('aqua_illustrated_pages_v3');
      localStorage.removeItem('aqua_vector_pages_v3');
      localStorage.removeItem('aqua_vector_chapters_v3');
      localStorage.removeItem('aqua_vector_cover_v3');
      comicAudio.playWaterDrop();
      alert('Both comic stories reset to default!');
    }
  };

  const exportAllStoriesJson = () => {
    const data = {
      title: 'The Hand in the Water - Complete Comic Stories',
      version: '3.0',
      exportedAt: new Date().toISOString(),
      admin: adminUser,
      illustratedPages,
      vectorCover,
      vectorChapters,
      vectorPages,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the-hand-in-the-water-both-stories-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    comicAudio.playSuccessChime();
  };

  const importAllStoriesJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.illustratedPages) setIllustratedPages(data.illustratedPages);
      if (data.vectorPages) setVectorPages(data.vectorPages);
      if (data.vectorChapters) setVectorChapters(data.vectorChapters);
      if (data.vectorCover) setVectorCover(data.vectorCover);
      comicAudio.playSuccessChime();
      alert('All comic story data imported successfully!');
      return true;
    } catch {
      alert('Invalid backup file.');
      return false;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isEditMode,
        adminUser,
        loginModalOpen,
        activeEditTarget,
        adminDrawerOpen,
        illustratedPages,
        vectorPages,
        vectorChapters,
        vectorCover,
        openLoginModal: () => setLoginModalOpen(true),
        closeLoginModal: () => setLoginModalOpen(false),
        login,
        logout,
        toggleEditMode,
        setAdminDrawerOpen,
        openEditor,
        closeEditor,
        updateIllustratedPanel,
        updateIllustratedPage,
        updateVectorPanel,
        updateVectorPage,
        updateVectorChapter,
        updateVectorCover,
        addVectorPanel,
        deleteVectorPanel,
        addVectorPage,
        deleteVectorPage,
        resetBothStoriesToDefaults,
        exportAllStoriesJson,
        importAllStoriesJson,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};
