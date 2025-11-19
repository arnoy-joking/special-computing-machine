# **App Name**: NodeMusic

## Core Features:

- Home Feed: Fetches and structures the home feed from YouTube Music, handling MusicCarouselShelf and MusicImmersiveCarousel sections, and displays the content in horizontal scrolling lists.
- Predictive Search: Provides search suggestions as the user types by fetching data from the /api/suggestions endpoint. Offers suggestions in a dropdown list.
- Album View: Fetches and displays all tracks inside a selected album from the Home Feed using the /api/album endpoint.
- Search with Filters: Allows users to search for songs and albums with filtering options.
- Playback Queue and Radio: Generates a dynamic playback queue using the getUpNext method for a radio-like experience.
- Lyrics Fetcher: Retrieves and displays lyrics for the currently playing song.
- Library Persistence: Allows users to 'Like' songs, which are then stored in localStorage using Zustand's persist middleware. It also maintains the music history.

## Style Guidelines:

- Primary color: #64B5F6 (Light blue) for a calm and modern feel, easy on the eyes.
- Background color: #121212 (Dark gray) for a sleek dark mode interface that reduces eye strain and emphasizes content.
- Accent color: #A7FFEB (Mint green) for highlights, interactive elements, and calls to action, creating visual interest without being too harsh.
- Body: 'Inter', a sans-serif with a machined, objective, neutral, modern look, suitable for long passages of text and for user interfaces; Headings: 'Space Grotesk', a proportional sans-serif with a computerized, techy, scientific feel, suitable for short text runs such as headings. Note: currently only Google Fonts are supported.
- Use flat, minimalistic icons with a thin stroke, in the accent color. Icons should be clear and easily recognizable.
- Implement glassmorphism effect with backdrop-blur-lg on the Sidebar and Player Footer for a modern, layered look. Ensure content scrolls smoothly behind these elements.
- Utilize framer-motion for smooth page transitions and subtle animations throughout the app, enhancing the user experience.