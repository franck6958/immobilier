"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, X } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 12;
const MAX_SIDE = 1920;

/** Redimensionne et convertit en WebP avant l'envoi (économise la data mobile et accélère le site). */
async function toWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("conversion impossible"))), "image/webp", 0.82),
  );
}

export function ImageUploader({
  userId,
  value,
  onChange,
  error,
}: {
  userId: string;
  value: string[];
  onChange: (urls: string[]) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const upload = async (files: FileList | File[]) => {
    setUploadError("");
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, MAX_IMAGES - value.length);
    if (!list.length) return;
    const supabase = createBrowserSupabase();
    setUploading(list.length);
    const urls: string[] = [];
    for (const file of list) {
      try {
        const blob = await toWebp(file);
        const path = `${userId}/${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage.from("property-images").upload(path, blob, { contentType: "image/webp" });
        if (upErr) throw upErr;
        urls.push(supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl);
      } catch (err) {
        console.error(err);
        setUploadError("Une photo n'a pas pu être envoyée. Vérifiez votre connexion et réessayez.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    onChange([...value, ...urls]);
  };

  const move = (i: number, d: number) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remove = (i: number) => onChange(value.filter((_, k) => k !== i));
  const full = value.length >= MAX_IMAGES;

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((src, i) => (
          <li key={src} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand ring-1 ring-line">
            <Image src={src} alt={`Photo ${i + 1}`} fill sizes="(min-width: 640px) 220px, 45vw" className="object-cover" />
            {i === 0 && (
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-ink">
                <Star className="size-3 fill-current" aria-hidden /> Photo principale
              </span>
            )}
            <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1">
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Déplacer la photo ${i + 1} vers la gauche`} className="grid size-9 place-items-center rounded-full bg-paper/90 text-ink shadow disabled:opacity-40">
                  <ArrowLeft className="size-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Déplacer la photo ${i + 1} vers la droite`} className="grid size-9 place-items-center rounded-full bg-paper/90 text-ink shadow disabled:opacity-40">
                  <ArrowRight className="size-4" />
                </button>
              </div>
              <button type="button" onClick={() => remove(i)} aria-label={`Retirer la photo ${i + 1}`} className="grid size-9 place-items-center rounded-full bg-danger text-white shadow">
                <X className="size-4" />
              </button>
            </div>
          </li>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <li key={`up-${i}`} className="grid aspect-[4/3] place-items-center rounded-2xl bg-white ring-1 ring-line" aria-label="Envoi en cours">
            <Loader2 className="size-6 animate-spin text-accent-strong" />
          </li>
        ))}
      </ul>

      {!full && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            upload(e.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
            dragOver ? "border-accent bg-accent-soft" : error ? "border-danger bg-danger/5" : "border-line bg-white",
          )}
        >
          <ImagePlus className="size-8 text-accent-strong" aria-hidden />
          <p className="text-sm text-muted">
            Glissez vos photos ici ou{" "}
            <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-ink underline underline-offset-2">
              choisissez-les sur votre appareil
            </button>
          </p>
          <p className="text-xs text-muted">JPG, PNG ou WebP · {MAX_IMAGES} photos maximum · la première sert de photo principale</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            aria-label="Ajouter des photos"
            onChange={(e) => {
              if (e.target.files) upload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}
      {(error || uploadError) && (
        <p role="alert" className="text-sm font-medium text-danger">{uploadError || error}</p>
      )}
    </div>
  );
}
