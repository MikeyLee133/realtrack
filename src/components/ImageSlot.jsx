import { useState, useEffect, useRef, useCallback } from 'react';
import { color, font } from '../lib/tokens.js';
import * as fileStore from '../lib/fileStore.js';

// Drag-and-drop image slot — the React port of the prototype's <image-slot>
// web component. Photos are stored via the fileStore (IndexedDB locally, the
// private Supabase bucket when configured), keyed by `<projectId>/<slotId>` so
// each is scoped to its project and safe from the ~5 MB localStorage quota.
const slotPath = (projectId, id) => `${projectId || 'local'}/${id}`;

export default function ImageSlot({ id, projectId, placeholder, radius = 12, style }) {
  const path = slotPath(projectId, id);
  const [src, setSrc] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const objectUrlRef = useRef(null);

  // Swap the displayed src, revoking any previous object URL to avoid leaks.
  const showUrl = useCallback((url) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = url && url.startsWith('blob:') ? url : null;
    setSrc(url);
  }, []);

  useEffect(() => {
    let alive = true;
    fileStore.getUrl(path).then((url) => { if (alive) showUrl(url); }).catch(() => {});
    return () => {
      alive = false;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    };
  }, [path, showUrl]);

  const accept = useCallback(
    async (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      try {
        await fileStore.put(path, file);
        const url = await fileStore.getUrl(path);
        showUrl(url);
      } catch {
        /* ignore — upload failed */
      }
    },
    [path, showUrl]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    accept(e.dataTransfer.files?.[0]);
  };

  const clear = async (e) => {
    e.stopPropagation();
    showUrl(null);
    try {
      await fileStore.remove(path);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      style={{
        position: 'relative',
        borderRadius: radius,
        overflow: 'hidden',
        cursor: 'pointer',
        background: src ? '#000' : '#F1EEE9',
        border: dragOver ? `2px dashed ${color.accent}` : `1px dashed ${src ? 'transparent' : '#D8D3CA'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => accept(e.target.files?.[0])}
      />
      {src ? (
        <>
          <img src={src} alt={placeholder} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button
            onClick={clear}
            title="Remove photo"
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 22,
              height: 22,
              borderRadius: 6,
              border: 'none',
              background: 'rgba(27,26,23,0.6)',
              color: '#fff',
              fontSize: 14,
              lineHeight: '20px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color.fainter} strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: color.fainter, marginTop: 6, letterSpacing: '0.03em' }}>
            {placeholder}
          </div>
        </div>
      )}
    </div>
  );
}
