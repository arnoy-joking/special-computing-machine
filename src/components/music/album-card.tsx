"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Album } from "@/lib/types";

export function AlbumCard({ album }: { album: Album }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="w-full"
    >
      <Link href={`/album/${album.id}`} className="block group">
        <div className="relative">
          <Image
            src={album.artwork}
            alt={`Cover for ${album.title}`}
            width={400}
            height={400}
            className="rounded-lg shadow-md aspect-square object-cover"
            data-ai-hint={album.artworkHint}
          />
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {album.title}
          </h3>
          <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
        </div>
      </Link>
    </motion.div>
  );
}
