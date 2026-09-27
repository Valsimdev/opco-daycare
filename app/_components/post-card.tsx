"use client";

import { useState } from "react";
import type { Post } from "@/app/_data/mock";
import { Avatar } from "./avatar";
import { TagBadge } from "./tag-badge";

export interface PostPhotoData {
  url: string;
  width?: number | null;
  height?: number | null;
  position: number;
}

export interface PostChildData {
  id: string;
  full_name: string;
}

export interface PostCardData {
  id: string;
  author_name: string;
  type: string;
  title: string;
  body: string;
  published_at: string;
  time: string;
  children: PostChildData[];
  photos: PostPhotoData[];
}

interface PostCardProps {
  post: PostCardData | Post;
}

const TYPE_LABEL_MAP: Record<string, string> = {
  meal: "Comida",
  nap: "Siesta",
  activity: "Actividad",
  achievement: "Logro",
  mood: "Ánimo",
  photo: "Foto",
  announcement: "Anuncio",
};

function getRecipients(children: PostChildData[]): string {
  if (children.length === 0) return "toda la sala";
  if (children.length === 1) return `familia de ${children[0].full_name}`;
  const names = children.map((c) => c.full_name.split(" ")[0]);
  return `familias de ${names.join(", ")}`;
}

function isPostCardData(post: PostCardData | Post): post is PostCardData {
  return "author_name" in post;
}

function normalizePost(post: PostCardData | Post): PostCardData | null {
  if (isPostCardData(post)) return post;

  // Mock Post — convertir a PostCardData
  return {
    id: post.id,
    author_name: post.publishedBy?.split("·")[0]?.trim() ?? "Staff",
    type: post.type,
    title: post.title,
    body: post.text,
    published_at: new Date().toISOString(),
    time: post.time,
    children: [],
    photos: post.photoPlaceholder
      ? [{ url: "", position: 0 }]
      : [],
  };
}

export function PostCard({ post }: PostCardProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  const data = normalizePost(post);
  if (!data) return null;

  const hasPhotos = data.photos.length > 0 && data.photos[0].url !== "";
  const showCarousel = data.photos.length >= 2 && data.photos[0].url !== "";

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStart(clientX);
  };

  const handleDragEnd = (clientX: number) => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = clientX - dragStart;
    const threshold = 50;

    if (diff < -threshold && carouselIndex < data.photos.length - 1) {
      setCarouselIndex((prev) => prev + 1);
    } else if (diff > threshold && carouselIndex > 0) {
      setCarouselIndex((prev) => prev - 1);
    }
  };

  const goNext = () => {
    if (carouselIndex < data.photos.length - 1) {
      setCarouselIndex((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (carouselIndex > 0) {
      setCarouselIndex((prev) => prev - 1);
    }
  };

  const recipients = isPostCardData(post)
    ? getRecipients(post.children)
    : post.recipients;

  return (
    <article className="rounded-[20px] border border-border bg-surface px-[22px] py-5 shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
      <header className="mb-3.5 flex items-center gap-3">
        {data.type === "announcement" ? (
          <Avatar
            variant="indigo"
            size="lg"
            icon={
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" />
              </svg>
            }
          />
        ) : (
          <Avatar variant="sky" initial={data.title.charAt(0).toUpperCase()} size="lg" />
        )}
        <div className="flex-1">
          <div className="font-display text-[16.5px] font-semibold text-ink-900">{data.title}</div>
          <div className="text-[12.5px] text-ink-400">
            {data.time} · publicado por {data.author_name.split(" ")[0]}
          </div>
        </div>
        <TagBadge type={data.type} />
      </header>

      <p className="mb-2.5 text-[12.5px] text-ink-400">Para: {recipients}</p>
      <p className="m-0 text-[15.5px] leading-[1.55] text-ink-800">{data.body}</p>

      {/* Photos section */}
      {hasPhotos && !showCarousel && data.photos.length === 1 && (
        <div className="mt-3.5 overflow-hidden rounded-2xl" style={{ aspectRatio: "16 / 9" }}>
          <img
            src={data.photos[0].url}
            alt={`Foto de ${data.title}`}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {showCarousel && (
        <div className="relative mt-3.5 overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseUp={(e) => handleDragEnd(e.clientX)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
          >
            {data.photos.map((photo, idx) => (
              <div key={idx} className="relative w-full shrink-0" style={{ aspectRatio: "16 / 9" }}>
                <img
                  src={photo.url}
                  alt={`Foto ${idx + 1} de ${data.title}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Left arrow */}
          {carouselIndex > 0 && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 cursor-pointer transition-colors"
              aria-label="Foto anterior"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Right arrow */}
          {carouselIndex < data.photos.length - 1 && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 cursor-pointer transition-colors"
              aria-label="Foto siguiente"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {/* Dots indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {data.photos.map((_, idx) => (
              <div
                key={idx}
                className={`size-2 rounded-full transition-opacity ${
                  idx === carouselIndex ? "bg-white opacity-100" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
