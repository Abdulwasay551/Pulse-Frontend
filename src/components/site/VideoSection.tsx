"use client";

import { useRef, useState } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import RevealOnView from "./RevealOnView";

function getEmbedSrc(url: string): string | null {
  const youtube = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/
  );
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}?autoplay=1&rel=0`;

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;

  return null;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoSection({
  eyebrow,
  heading,
  subtitle,
  fileSrc,
  linkUrl,
  fallbackSrc,
}: {
  eyebrow: string;
  heading: string;
  subtitle: string;
  fileSrc: string;
  linkUrl: string;
  fallbackSrc: string;
}) {
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // CMS upload always wins; then an external link (used as-is if it's a
  // direct file/CDN URL, or swapped for a provider embed if it's a
  // YouTube/Vimeo page URL); otherwise the demo video shipped in backend
  // static — see HomePage.video_file / video_url in cms/models.py.
  const embedSrc = !fileSrc && linkUrl ? getEmbedSrc(linkUrl) : null;
  const directSrc = fileSrc || (!embedSrc && linkUrl ? linkUrl : "") || fallbackSrc;

  function play() {
    setStarted(true);
    requestAnimationFrame(() => {
      videoRef.current?.play();
    });
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
  }

  function requestFullscreen() {
    frameRef.current?.requestFullscreen?.();
  }

  function wakeControls() {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setShowControls(false);
    }, 2200);
  }

  return (
    <section className="relative overflow-hidden bg-ink px-6 py-24">
      <div
        aria-hidden="true"
        className="animate-drift-a pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary-light/10 blur-3xl"
      />

      <RevealOnView className="relative mx-auto max-w-2xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-4 py-1.5 text-xs uppercase tracking-wide text-primary-light">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
          {eyebrow}
        </div>
        <h2 className="font-display text-3xl font-bold text-cream md:text-4xl">{heading}</h2>
        <p className="mt-4 text-lg text-cream/60">{subtitle}</p>
      </RevealOnView>

      <RevealOnView delayMs={150} className="relative mx-auto mt-14 max-w-5xl">
        <div
          ref={frameRef}
          className="group relative overflow-hidden rounded-2xl border border-cream/10 bg-[#0d1f24] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
        >
          {/* Browser-chrome mockup bar — frames the demo as a real, running app */}
          <div className="flex h-10 items-center gap-2 border-b border-cream/10 bg-cream/[0.04] px-4">
            <span className="h-2.5 w-2.5 rounded-full bg-maroon/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary-light/70" />
            <span className="mx-auto flex items-center gap-1.5 rounded-full bg-cream/10 px-3 py-1 text-[11px] text-cream/50">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
              app.pulsehrm.io — live desk
            </span>
          </div>

          <div
            className="relative aspect-video w-full bg-[#0a171b]"
            onMouseMove={started ? wakeControls : undefined}
            onMouseLeave={() => started && !videoRef.current?.paused && setShowControls(false)}
          >
            {!started && (
              <button
                type="button"
                onClick={play}
                aria-label="Play the Pulse product demo"
                className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-6"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(var(--cream)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[8%] top-[18%] h-16 w-40 -rotate-3 rounded-xl border border-cream/10 bg-cream/5 backdrop-blur-sm md:h-20 md:w-56"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-[16%] right-[10%] h-20 w-44 rotate-2 rounded-xl border border-primary-light/20 bg-primary-light/10 backdrop-blur-sm md:h-24 md:w-60"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-[22%] left-[14%] h-12 w-28 rotate-1 rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm md:h-14 md:w-36"
                />

                <div className="relative flex h-20 w-20 items-center justify-center md:h-24 md:w-24">
                  <span className="animate-play-ring absolute inset-0 rounded-full bg-cream/30" />
                  <span
                    className="animate-play-ring absolute inset-0 rounded-full bg-cream/30"
                    style={{ animationDelay: "1.1s" }}
                  />
                  <span className="relative flex h-full w-full items-center justify-center rounded-full bg-cream text-ink shadow-lg transition-transform group-hover:scale-105">
                    <Play className="ml-1 h-8 w-8 fill-current md:h-9 md:w-9" />
                  </span>
                </div>

                <span className="relative rounded-full bg-ink/60 px-4 py-1.5 text-sm font-medium text-cream backdrop-blur-sm">
                  Watch the product tour
                </span>
              </button>
            )}

            {started && embedSrc && (
              <iframe
                src={embedSrc}
                title="Pulse product demo"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            )}

            {started && !embedSrc && (
              <>
                <video
                  ref={videoRef}
                  src={directSrc}
                  className="absolute inset-0 h-full w-full"
                  autoPlay
                  onClick={togglePlay}
                  onPlay={() => {
                    setPlaying(true);
                    wakeControls();
                  }}
                  onPause={() => {
                    setPlaying(false);
                    setShowControls(true);
                  }}
                  onTimeUpdate={(e) => {
                    const v = e.currentTarget;
                    setCurrentTime(v.currentTime);
                    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
                  }}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                />

                <div
                  className={`absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-ink/90 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300 ${
                    showControls ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div
                    onClick={seek}
                    className="h-1.5 w-full cursor-pointer rounded-full bg-cream/20"
                  >
                    <div
                      className="h-full rounded-full bg-primary-light"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={playing ? "Pause" : "Play"}
                      className="text-cream transition-colors hover:text-primary-light"
                    >
                      {playing ? (
                        <Pause className="h-5 w-5 fill-current" />
                      ) : (
                        <Play className="h-5 w-5 fill-current" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={muted ? "Unmute" : "Mute"}
                      className="text-cream transition-colors hover:text-primary-light"
                    >
                      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                    <span className="text-xs tabular-nums text-cream/60">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    <button
                      type="button"
                      onClick={requestFullscreen}
                      aria-label="Fullscreen"
                      className="ml-auto text-cream transition-colors hover:text-primary-light"
                    >
                      <Maximize className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </RevealOnView>
    </section>
  );
}
