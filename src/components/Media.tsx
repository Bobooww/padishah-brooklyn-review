'use client';

import { useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/content/types';
import { REVIEW_MODE, rightsState } from '@/lib/review-mode';
import { COPY, type Lang } from '@/content/copy';

/* ------------------------------------------------------------------ badge */

export function RightsBadge({ asset, lang = 'en' }: { asset: MediaAsset; lang?: Lang }) {
  if (!REVIEW_MODE) return null;
  const state = rightsState(asset);
  if (state === 'cleared') return null;
  const c = COPY[lang].review;
  return (
    <span className="rights" data-state={state}>
      <span className="rights__dot" aria-hidden="true" />
      {state === 'release_required' ? c.badgeRelease : c.badgeReviewOnly}
    </span>
  );
}

/* ------------------------------------------------------------------ still */

type StillProps = {
  asset: MediaAsset;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  lang?: Lang;
};

export function Still({ asset, alt, sizes = '100vw', className = '', priority, lang }: StillProps) {
  const web = asset.web;
  if (!web) return null;
  const webp = web.sources.filter((s) => s.src.endsWith('.webp'));
  const jpg = web.sources.filter((s) => !s.src.endsWith('.webp'));
  const largest = jpg[jpg.length - 1] ?? webp[webp.length - 1];
  const srcset = (list: typeof webp) => list.map((s) => `${s.src} ${s.width}w`).join(', ');
  const manifestAlt = asset.alt?.[lang ?? 'en'] ?? alt;

  return (
    <figure className={`frame ${className}`}>
      <div className="frame__core" style={{ aspectRatio: `${largest.width} / ${largest.height}` }}>
        <picture>
          {webp.length > 0 && <source type="image/webp" srcSet={srcset(webp)} sizes={sizes} />}
          <img
            src={largest.src}
            srcSet={srcset(jpg)}
            sizes={sizes}
            alt={manifestAlt}
            width={largest.width}
            height={largest.height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : undefined}
            style={web.lqip ? { backgroundImage: `url(${web.lqip})`, backgroundSize: 'cover' } : undefined}
          />
        </picture>
      </div>
      <RightsBadge asset={asset} lang={lang} />
    </figure>
  );
}

/* ------------------------------------------------------------------- loop */

type LoopProps = {
  asset: MediaAsset;
  alt: string;
  className?: string;
  /** Hero loops load immediately; everything else waits for intersection. */
  priority?: boolean;
  /** Force one orientation instead of choosing by viewport. */
  orientation?: 'portrait' | 'landscape';
  showControl?: boolean;
  lang?: Lang;
};

export function Loop({
  asset,
  alt,
  className = '',
  priority = false,
  orientation,
  showControl = true,
  lang = 'en',
}: LoopProps) {
  const ref = useRef<HTMLVideoElement>(null);
  // Set only by the visible control: the visibility observer must never undo a
  // deliberate pause when the loop scrolls out and back in.
  const userPaused = useRef(false);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const web = asset.web;
  const poster = web?.poster?.src;
  const c = COPY[lang].hero;
  const manifestAlt = asset.alt?.[lang] ?? alt;

  useEffect(() => {
    if (!web) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduced || saveData) return; // poster only — the still already tells the story

    const wide = window.matchMedia('(min-width: 860px)').matches;
    const want = orientation ?? (wide ? 'landscape' : 'portrait');
    const chosen = web.sources.find((s) => s.src.includes(`-${want}.mp4`)) ?? web.sources[0];
    if (!chosen) return;

    if (priority) {
      setSrc(chosen.src);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSrc(chosen.src);
          io.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [web, orientation, priority]);

  // Play only while on screen; never burn battery off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !userPaused.current) void el.play().catch(() => undefined);
          else if (!e.isIntersecting) el.pause();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  if (!web || !poster) return null;

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      userPaused.current = false;
      void el.play();
    } else {
      userPaused.current = true;
      el.pause();
    }
  };

  return (
    <figure className={`frame frame--loop ${className}`} data-portrait={orientation === 'portrait' ? 'true' : 'false'}>
      <div className="frame__core">
        <video
          ref={ref}
          poster={poster}
          src={src ?? undefined}
          muted
          loop
          playsInline
          preload={priority ? 'auto' : 'none'}
          aria-label={manifestAlt}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedData={() => setReady(true)}
          data-ready={ready ? 'true' : 'false'}
        />
        {showControl && src && (
          // Its accessible name flips between "pause" and "play" — that is the whole
          // state; aria-pressed on top of a changing label reads as double-speak.
          <button type="button" className="loopctl" onClick={toggle}>
            <span className="loopctl__glyph" aria-hidden="true">
              {playing ? '❙❙' : '▶'}
            </span>
            <span className="u-sr">{playing ? c.pause : c.play}</span>
          </button>
        )}
      </div>
      <RightsBadge asset={asset} lang={lang} />
    </figure>
  );
}
