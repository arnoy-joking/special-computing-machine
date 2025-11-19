import type { Album, MusicCarouselSection, Track } from "./types";
import { PlaceHolderImages } from "./placeholder-images";

const artists = ["Neon Bloom", "Cosmic Drift", "Echo Valley", "Starlight Parade", "Solar Echoes", "Future Islands"];

const getArt = (index: number) => {
    const img = PlaceHolderImages[index % PlaceHolderImages.length];
    return {
        artwork: img.imageUrl,
        artworkHint: img.imageHint
    };
}

export const albums: Album[] = [
    { id: "album-1", title: "Digital Dreams", artist: artists[0], year: 2023, ...getArt(0) },
    { id: "album-2", title: "Stardust", artist: artists[1], year: 2022, ...getArt(1) },
    { id: "album-3", title: "Whispering Pines", artist: artists[2], year: 2024, ...getArt(2) },
    { id: "album-4", title: "Electric Avenue", artist: artists[3], year: 2021, ...getArt(3) },
    { id: "album-5", title: "Celestial", artist: artists[4], year: 2023, ...getArt(4) },
    { id: "album-6", title: "The Far Field", artist: artists[5], year: 2017, ...getArt(5) },
    { id: "album-7", title: "Ocean Drive", artist: artists[0], year: 2021, ...getArt(6) },
    { id: "album-8", title: "Retrograde", artist: artists[1], year: 2024, ...getArt(7) },
    { id: "album-9", title: "Forest Floor", artist: artists[2], year: 2022, ...getArt(8) },
    { id: "album-10", title: "Neon Nights", artist: artists[3], year: 2023, ...getArt(9) },
    { id: "album-11", title: "Andromeda", artist: artists[4], year: 2022, ...getArt(10) },
    { id: "album-12", title: "Singles", artist: artists[5], year: 2020, ...getArt(11) },
];

export const tracks: Track[] = [
    // Digital Dreams
    { id: "track-101", title: "Cybernetic Sunrise", artist: artists[0], album: "Digital Dreams", albumId: "album-1", duration: "3:45", ...getArt(0) },
    { id: "track-102", title: "Holographic Heart", artist: artists[0], album: "Digital Dreams", albumId: "album-1", duration: "4:12", ...getArt(0) },
    { id: "track-103", title: "Pixelated Love", artist: artists[0], album: "Digital Dreams", albumId: "album-1", duration: "3:58", ...getArt(0) },
    // Stardust
    { id: "track-201", title: "Cosmic Dust", artist: artists[1], album: "Stardust", albumId: "album-2", duration: "5:02", ...getArt(1) },
    { id: "track-202", title: "Gravity's Pull", artist: artists[1], album: "Stardust", albumId: "album-2", duration: "4:30", ...getArt(1) },
    // Whispering Pines
    { id: "track-301", title: "First Light", artist: artists[2], album: "Whispering Pines", albumId: "album-3", duration: "3:15", ...getArt(2) },
    // Electric Avenue
    { id: "track-401", title: "8-Bit Summer", artist: artists[3], album: "Electric Avenue", albumId: "album-4", duration: "2:55", ...getArt(3) },
    // Celestial
    { id: "track-501", title: "Orion's Belt", artist: artists[4], album: "Celestial", albumId: "album-5", duration: "6:10", ...getArt(4) },
    // The Far Field
    { id: "track-601", title: "Ran", artist: artists[5], album: "The Far Field", albumId: "album-6", duration: "3:25", ...getArt(5) },
    { id: "track-602", title: "Aladdin", artist: artists[5], album: "The Far Field", albumId: "album-6", duration: "4:13", ...getArt(5) },
];

export const homeFeed: MusicCarouselSection[] = [
    {
        title: "New Releases",
        items: albums.slice(0, 6)
    },
    {
        title: "Featured Playlists",
        items: albums.slice(6, 12)
    },
    {
        title: "Today's Biggest Hits",
        items: albums.slice(2, 8).reverse()
    }
];
