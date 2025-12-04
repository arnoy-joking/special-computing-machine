"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Track } from "@/lib/types"
import { TrackCard } from "./track-card"

interface MusicCarouselProps {
  title: string
  items: Track[]
  onPlay: (track: Track) => void
}

export function MusicCarouselSection({ title, items, onPlay }: MusicCarouselProps) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="relative"
      >
        <CarouselContent className="-ml-4">
          {items.map((track, index) => (
            <CarouselItem key={index} className="pl-4 basis-auto">
              <TrackCard track={track} onPlay={() => onPlay(track)} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background border-2 h-10 w-10 disabled:opacity-0" />
        <CarouselNext className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background border-2 h-10 w-10 disabled:opacity-0" />
      </Carousel>
    </section>
  )
}
