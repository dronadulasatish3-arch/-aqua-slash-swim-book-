import React, { useState, useEffect } from 'react';
import { useAdmin, EditTarget } from '../../context/AdminContext';
import {
  X,
  Save,
  Image as ImageIcon,
  Upload,
  MessageSquare,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import type { SayPos, SayKind } from '../../comic/types';

const PRELOADED_GALLERY_IMAGES = [
  { name: 'Hand in Water (Original River)', url: '/images/cover-hand-in-water.jpg' },
  { name: 'Village River & Route', url: '/images/act-village-waters.jpg' },
  { name: 'National Games Competition', url: '/images/act-national-games.jpg' },
  { name: 'Lifeguard & Coach at Pool', url: '/images/act-lifeguard-coach.jpg' },
  { name: 'Childhood River Reflections', url: '/images/act-108-drops.jpg' },
];

export const UniversalEditModal: React.FC = () => {
  const {
    activeEditTarget,
    closeEditor,
    updateIllustratedPanel,
    updateIllustratedPage,
    updateVectorPanel,
    updateVectorPage,
    updateVectorChapter,
    updateVectorCover,
    vectorCover,
  } = useAdmin();

  const [formData, setFormData] = useState<any>({});
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (!activeEditTarget) return;

    const targetType = activeEditTarget.type as string;

    if (targetType === 'vector-panel' || targetType === 'panel') {
      const p = (activeEditTarget as any).panel;
      let sayText = '';
      let sayPos: SayPos = 'tl';
      let sayKind: SayKind = 'say';

      if (typeof p.say === 'string') {
        sayText = p.say;
      } else if (Array.isArray(p.say)) {
        sayText = p.say[0] || '';
        sayPos = (p.say[1] as SayPos) || 'tl';
        sayKind = (p.say[2] as SayKind) || 'say';
      }

      setFormData({
        cap: p.cap || '',
        tag: p.tag || '',
        sfx: p.sfx || '',
        sfxAt: p.sfxAt || 'tr',
        sayText,
        sayPos,
        sayKind,
        customImg: p.customImg || '',
      });
      setImagePreview(p.customImg || '');
    } else if (targetType === 'illustrated-panel') {
      const p = (activeEditTarget as any).panel;
      setFormData({
        narratorCaption: p.narratorCaption || '',
        locationTag: p.locationTag || '',
        storyLinesText: p.storyLines ? p.storyLines.join('\n') : '',
        speaker: p.speechBubble?.speaker || '',
        speechText: p.speechBubble?.text || '',
        speechType: p.speechBubble?.type || 'speech',
        sfxText: p.sfx?.text || '',
        sfxColor: p.sfx?.color || '#38BDF8',
        customImage: (p as any).customImage || '',
      });
      setImagePreview((p as any).customImage || '');
    } else if (targetType === 'illustrated-page') {
      const pg = (activeEditTarget as any).page;
      setFormData({
        title: pg.title || '',
        subtitle: pg.subtitle || '',
        chapterCode: pg.chapterCode || '',
        eraBadge: pg.eraBadge || '',
        summaryQuote: pg.summaryQuote || '',
        actImage: pg.actImage || '',
      });
      setImagePreview(pg.actImage || '');
    } else if (targetType === 'vector-chapter' || targetType === 'chapter') {
      setFormData({
        title: (activeEditTarget as any).title || '',
      });
    } else if (targetType === 'vector-page' || targetType === 'page') {
      setFormData({
        sub: (activeEditTarget as any).page?.sub || '',
      });
    } else if (targetType === 'vector-cover') {
      setFormData({
        badge: vectorCover.badge || '',
        titleTop: vectorCover.titleTop || '',
        titleHighlight: vectorCover.titleHighlight || '',
        subtitle: vectorCover.subtitle || '',
        slogan: vectorCover.slogan || '',
        bgImage: vectorCover.bgImage || '',
      });
      setImagePreview(vectorCover.bgImage || '');
    }
  }, [activeEditTarget, vectorCover]);

  if (!activeEditTarget) return null;

  const targetType = activeEditTarget.type as string;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      if (targetType === 'vector-panel' || targetType === 'panel') {
        setFormData((prev: any) => ({ ...prev, customImg: result }));
      } else if (targetType === 'illustrated-panel') {
        setFormData((prev: any) => ({ ...prev, customImage: result }));
      } else if (targetType === 'vector-cover') {
        setFormData((prev: any) => ({ ...prev, bgImage: result }));
      } else if (targetType === 'illustrated-page') {
        setFormData((prev: any) => ({ ...prev, actImage: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (targetType === 'vector-panel' || targetType === 'panel') {
      const pageIndex = (activeEditTarget as any).pageIndex;
      const panelIndex = (activeEditTarget as any).panelIndex;
      const updates: any = {
        cap: formData.cap,
        tag: formData.tag || undefined,
        sfx: formData.sfx || undefined,
        sfxAt: formData.sfxAt || undefined,
        customImg: formData.customImg || undefined,
      };

      if (formData.sayText && formData.sayText.trim().length > 0) {
        updates.say = [formData.sayText.trim(), formData.sayPos, formData.sayKind];
      } else {
        updates.say = undefined;
      }

      updateVectorPanel(pageIndex, panelIndex, updates);
    } else if (targetType === 'illustrated-panel') {
      const panelTarget = activeEditTarget as { pageNumber: number; panel: any };
      const storyLines = formData.storyLinesText
        ? formData.storyLinesText.split('\n').filter((l: string) => l.trim().length > 0)
        : panelTarget.panel.storyLines;

      updateIllustratedPanel(panelTarget.pageNumber, panelTarget.panel.panelNumber, {
        narratorCaption: formData.narratorCaption,
        locationTag: formData.locationTag,
        storyLines,
        speechBubble: formData.speechText
          ? {
              speaker: formData.speaker || 'HERO',
              text: formData.speechText,
              type: formData.speechType,
            }
          : undefined,
        sfx: formData.sfxText
          ? {
              text: formData.sfxText,
              color: formData.sfxColor,
            }
          : undefined,
        customImage: formData.customImage || '',
      });
    } else if (targetType === 'illustrated-page') {
      const pageTarget = activeEditTarget as { pageNumber: number };
      updateIllustratedPage(pageTarget.pageNumber, {
        title: formData.title,
        subtitle: formData.subtitle,
        chapterCode: formData.chapterCode,
        eraBadge: formData.eraBadge,
        summaryQuote: formData.summaryQuote,
        actImage: formData.actImage,
      });
    } else if (targetType === 'vector-chapter' || targetType === 'chapter') {
      const chNum = (activeEditTarget as any).chapterNumber;
      updateVectorChapter(chNum, formData.title);
    } else if (targetType === 'vector-page' || targetType === 'page') {
      const pIdx = (activeEditTarget as any).pageIndex;
      updateVectorPage(pIdx, { sub: formData.sub });
    } else if (targetType === 'vector-cover') {
      updateVectorCover({
        badge: formData.badge,
        titleTop: formData.titleTop,
        titleHighlight: formData.titleHighlight,
        subtitle: formData.subtitle,
        slogan: formData.slogan,
        bgImage: formData.bgImage || undefined,
      });
    }

    closeEditor();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-4 border-black bg-[#fffaf0] p-6 text-slate-900 shadow-[10px_10px_0_#000] my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-yellow-400 px-2 py-0.5 font-mono text-xs font-bold border border-black text-black">
              STORY EDITOR
            </span>
            <h3 className="font-bangers text-2xl tracking-wide text-slate-950">
              {(targetType === 'vector-panel' || targetType === 'panel') &&
                `EDIT VECTOR PANEL #${(activeEditTarget as any).panelIndex + 1} (PAGE ${(activeEditTarget as any).pageIndex + 1})`}
              {targetType === 'illustrated-panel' &&
                `EDIT ILLUSTRATED PANEL #${(activeEditTarget as any).panel.panelNumber} (PAGE ${(activeEditTarget as any).pageNumber})`}
              {targetType === 'illustrated-page' &&
                `EDIT ILLUSTRATED PAGE ${(activeEditTarget as any).pageNumber}`}
              {(targetType === 'vector-chapter' || targetType === 'chapter') &&
                `EDIT CHAPTER ${(activeEditTarget as any).chapterNumber} TITLE`}
              {(targetType === 'vector-page' || targetType === 'page') &&
                `EDIT PAGE ${(activeEditTarget as any).pageIndex + 1} SUBTITLE`}
              {targetType === 'vector-cover' && 'EDIT COMIC BOOK COVER'}
            </h3>
          </div>

          <button
            onClick={closeEditor}
            className="rounded-lg border-2 border-black bg-rose-500 p-1 text-white hover:bg-rose-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="mt-4 flex-1 overflow-y-auto pr-1 space-y-4">
          {/* VECTOR PANEL FORM */}
          {(targetType === 'vector-panel' || targetType === 'panel') && (
            <>
              {/* Caption */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Narrator Caption / Story Description
                </label>
                <textarea
                  rows={3}
                  value={formData.cap || ''}
                  onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
                  placeholder="Enter the caption that appears underneath the panel..."
                  className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Speech Bubble */}
              <div className="rounded-xl border-2 border-black bg-sky-50 p-3 space-y-2.5">
                <span className="font-bold text-xs text-sky-900 block flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Character Speech / Thought Bubble
                </span>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">
                    Dialogue Text (Leave blank if character doesn't speak)
                  </label>
                  <input
                    type="text"
                    value={formData.sayText || ''}
                    onChange={(e) => setFormData({ ...formData, sayText: e.target.value })}
                    placeholder="e.g. Look at that river... or Stop! Help!"
                    className="w-full rounded-lg border border-slate-400 p-2 text-xs bg-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block">Bubble Style</label>
                    <select
                      value={formData.sayKind || 'say'}
                      onChange={(e) => setFormData({ ...formData, sayKind: e.target.value })}
                      className="w-full rounded-lg border border-slate-400 p-1.5 text-xs bg-white"
                    >
                      <option value="say">Normal Speech (Oval with Tail)</option>
                      <option value="think">Thought Bubble (Cloud with Circles)</option>
                      <option value="shout">Shout / Exclamation (Spiky Yellow)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block">Placement in Panel</label>
                    <select
                      value={formData.sayPos || 'tl'}
                      onChange={(e) => setFormData({ ...formData, sayPos: e.target.value })}
                      className="w-full rounded-lg border border-slate-400 p-1.5 text-xs bg-white"
                    >
                      <option value="tl">Top-Left</option>
                      <option value="tr">Top-Right</option>
                      <option value="bl">Bottom-Left</option>
                      <option value="br">Bottom-Right</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tag & SFX */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-700 block">
                    Scene / Location Tag
                  </label>
                  <input
                    type="text"
                    value={formData.tag || ''}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g. SCHOOL - 4 KM"
                    className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-700 block">
                    Comic SFX (Action Sound)
                  </label>
                  <input
                    type="text"
                    value={formData.sfx || ''}
                    onChange={(e) => setFormData({ ...formData, sfx: e.target.value })}
                    placeholder="e.g. SPLASH!! or SWOOOSH"
                    className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2 text-xs font-bangers text-rose-600 tracking-wider"
                  />
                </div>
              </div>

              {/* Image Replacement */}
              <div className="rounded-xl border-2 border-black bg-amber-50 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> Replace Panel with Custom Image / Photo
                  </span>

                  {formData.customImg && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, customImg: '' });
                        setImagePreview('');
                      }}
                      className="text-[10px] font-bold text-rose-700 underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Revert to Vector Scene
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer flex items-center gap-1.5 rounded-lg border-2 border-black bg-yellow-400 px-3 py-1.5 font-bangers text-xs tracking-wider text-black shadow-[2px_2px_0_#000] hover:bg-yellow-300">
                    <Upload className="w-3.5 h-3.5" /> UPLOAD IMAGE FROM COMPUTER
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-500">Supports JPG, PNG, WebP</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">
                    Or Image URL / Pre-loaded Photo
                  </label>
                  <input
                    type="text"
                    value={formData.customImg || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, customImg: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://... or /images/..."
                    className="w-full rounded-lg border border-slate-400 p-1.5 text-xs bg-white"
                  />
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {PRELOADED_GALLERY_IMAGES.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, customImg: item.url });
                        setImagePreview(item.url);
                      }}
                      className="text-[10px] bg-white border border-slate-400 rounded px-2 py-0.5 hover:bg-amber-100"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>

                {imagePreview && (
                  <div className="mt-2 rounded-lg border-2 border-black overflow-hidden max-h-40 bg-black">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ILLUSTRATED PANEL FORM */}
          {activeEditTarget.type === 'illustrated-panel' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700">
                  Narrator Caption
                </label>
                <textarea
                  rows={3}
                  value={formData.narratorCaption || ''}
                  onChange={(e) => setFormData({ ...formData, narratorCaption: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700">
                  Location Tag
                </label>
                <input
                  type="text"
                  value={formData.locationTag || ''}
                  onChange={(e) => setFormData({ ...formData, locationTag: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2 text-xs"
                />
              </div>

              <div className="rounded-xl border-2 border-black bg-white p-3 space-y-2">
                <span className="font-bold text-xs text-sky-800 block">💬 Speech Bubble</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.speaker || ''}
                    onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                    placeholder="Speaker Name"
                    className="rounded border p-1 text-xs"
                  />
                  <select
                    value={formData.speechType || 'speech'}
                    onChange={(e) => setFormData({ ...formData, speechType: e.target.value })}
                    className="rounded border p-1 text-xs bg-white"
                  >
                    <option value="speech">Speech</option>
                    <option value="thought">Thought</option>
                    <option value="shout">Shout</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={formData.speechText || ''}
                  onChange={(e) => setFormData({ ...formData, speechText: e.target.value })}
                  placeholder="Dialogue text..."
                  className="w-full rounded border p-1.5 text-xs"
                />
              </div>

              {/* Detailed Story Lines */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Detailed Story Lines (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.storyLinesText || ''}
                  onChange={(e) => setFormData({ ...formData, storyLinesText: e.target.value })}
                  placeholder="Enter story narration lines..."
                  className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2 font-comic text-xs text-slate-900"
                />
              </div>

              {/* Upload custom scene image */}
              <div className="rounded-xl border-2 border-black bg-amber-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-900 block">Replace Scene Artwork</span>
                  {(formData.customImage || imagePreview) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, customImage: '' });
                        setImagePreview('');
                      }}
                      className="text-xs font-bold text-rose-600 underline cursor-pointer"
                    >
                      Reset to Default Artwork
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-yellow-400 px-3 py-1 font-bangers text-xs text-black shadow-[2px_2px_0_#000] hover:bg-yellow-300">
                    <Upload className="w-3.5 h-3.5" /> UPLOAD IMAGE FILE
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.customImage || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, customImage: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="Or enter image URL: https://... or /images/..."
                  className="w-full rounded border p-1 text-xs bg-white"
                />
                {imagePreview && (
                  <div className="mt-2 rounded-lg border-2 border-black overflow-hidden max-h-36 bg-black">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ILLUSTRATED PAGE FORM */}
          {activeEditTarget.type === 'illustrated-page' && (
            <>
              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block">Page Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-black p-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-black p-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block">Key Takeaway Quote</label>
                <textarea
                  rows={2}
                  value={formData.summaryQuote || ''}
                  onChange={(e) => setFormData({ ...formData, summaryQuote: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-black p-2 text-xs"
                />
              </div>
            </>
          )}

          {/* CHAPTER FORM */}
          {(targetType === 'vector-chapter' || targetType === 'chapter') && (
            <div>
              <label className="text-xs font-bold uppercase text-slate-700 block">
                Chapter {(activeEditTarget as any).chapterNumber} Title
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-yellow-400"
              />
            </div>
          )}

          {/* SUBTITLE FORM */}
          {(targetType === 'vector-page' || targetType === 'page') && (
            <div>
              <label className="text-xs font-bold uppercase text-slate-700 block">
                Page {((activeEditTarget as any).pageIndex ?? 0) + 1} Subtitle / Section Tag
              </label>
              <input
                type="text"
                value={formData.sub || ''}
                onChange={(e) => setFormData({ ...formData, sub: e.target.value })}
                placeholder="e.g. The Boy Who Followed Water"
                className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2.5 text-sm font-bold text-slate-900"
              />
            </div>
          )}

          {/* COVER FORM */}
          {activeEditTarget.type === 'vector-cover' && (
            <>
              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block">
                  Top Badge Text
                </label>
                <input
                  type="text"
                  value={formData.badge || ''}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-700 block">
                    Title Top Line
                  </label>
                  <input
                    type="text"
                    value={formData.titleTop || ''}
                    onChange={(e) => setFormData({ ...formData, titleTop: e.target.value })}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-700 block">
                    Title Highlight Line
                  </label>
                  <input
                    type="text"
                    value={formData.titleHighlight || ''}
                    onChange={(e) => setFormData({ ...formData, titleHighlight: e.target.value })}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block">
                  Footer Slogan
                </label>
                <input
                  type="text"
                  value={formData.slogan || ''}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-white p-2 text-xs font-bold text-slate-900"
                />
              </div>

              {/* Cover Image */}
              <div className="rounded-xl border-2 border-black bg-amber-50 p-3 space-y-2">
                <span className="font-bold text-xs text-amber-900 block">Cover Background Image</span>
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-yellow-400 px-3 py-1.5 font-bangers text-xs tracking-wider text-black shadow-[2px_2px_0_#000]">
                  <Upload className="w-3.5 h-3.5" /> UPLOAD COVER IMAGE FILE
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                <input
                  type="text"
                  value={formData.bgImage || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, bgImage: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  className="w-full rounded-lg border border-slate-400 p-1.5 text-xs bg-white"
                  placeholder="Image URL"
                />
                {imagePreview && (
                  <div className="rounded-lg border-2 border-black overflow-hidden max-h-36 bg-black">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Submit Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t-2 border-black pt-4">
            <button
              type="button"
              onClick={closeEditor}
              className="rounded-xl border-2 border-black bg-slate-200 px-4 py-2 font-bangers text-sm tracking-wider text-slate-800 hover:bg-slate-300 cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl border-3 border-black bg-yellow-400 px-6 py-2 font-bangers text-base tracking-wider text-black shadow-[3px_3px_0_#000] hover:bg-yellow-300 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> SAVE CHANGES
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
