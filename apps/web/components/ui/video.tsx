"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";

import { cn } from "@/lib/utils";

interface VideoProps {
  src: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function Video({ src, title, className, autoPlay = false }: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) video.pause();
      },
      { threshold: 0.2 },
    );
    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  const togglePlay = useCallback((event?: React.SyntheticEvent) => {
    event?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void video.requestFullscreen?.();
    }
  }, []);

  const seek = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const nextTime = Number(event.target.value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  return (
    <div
      className={cn("group/video relative h-full w-full overflow-hidden bg-black", className)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        title={title}
        preload="metadata"
        playsInline
        autoPlay={autoPlay}
        muted={isMuted}
        className="h-full w-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          setIsMuted(event.currentTarget.muted);
        }}
      />

      {!isPlaying ? (
        <span className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="grid size-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm">
            <Play className="size-5 fill-current" />
          </span>
        </span>
      ) : null}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-2 text-white transition-opacity",
          isPlaying ? "opacity-0 group-hover/video:opacity-100" : "opacity-100",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          onClick={togglePlay}
          className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/30"
        >
          {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
        </button>
        <span className="shrink-0 text-[11px] tabular-nums text-white/90">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <input
          type="range"
          aria-label="Seek video"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={seek}
          className="h-1 min-w-0 flex-1 cursor-pointer accent-white"
        />
        <button
          type="button"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          onClick={toggleMute}
          className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/30"
        >
          {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
        </button>
        <button
          type="button"
          aria-label="Fullscreen video"
          onClick={toggleFullscreen}
          className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/30"
        >
          <Maximize className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
