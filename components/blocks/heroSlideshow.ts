// State rules for the hero's photo slideshow (see HeroPhotos in Hero.tsx).
// Photos are tracked by `_key`, never by position, so a photo that fails to
// load can drop out without the others shifting. Each appearance of a photo is
// a slide with its own `seq`, so its fade and zoom run once, start to finish.

type Photo = { _key: string };

export type Slide = { key: string; seq: number };

export type SlideshowState = {
  current: Slide;
  previous: Slide | null;
  /** Photos that failed to load; skipped from then on. */
  failed: string[];
  /** Slides (by slideId) whose photo has loaded. */
  loaded: string[];
  /** The timer fired before the next photo had loaded. */
  waiting: boolean;
  /** Paused by the visitor: nothing advances until resumed. */
  paused: boolean;
};

export type SlideshowAction =
  | { type: "tick"; photos: Photo[] }
  | { type: "loaded"; id: string; photos: Photo[] }
  | { type: "failed"; key: string; photos: Photo[] }
  | { type: "pause" }
  | { type: "resume"; photos: Photo[] };

export const slideId = (slide: Slide) => `${slide.key}-${slide.seq}`;

export function initialSlideshow(photos: Photo[]): SlideshowState {
  return {
    current: { key: photos[0]?._key ?? "", seq: 0 },
    previous: null,
    failed: [],
    loaded: [],
    waiting: false,
    paused: false,
  };
}

/** The photo after the current one that hasn't failed, or null if none. */
export function nextSlide(state: SlideshowState, photos: Photo[]): Slide | null {
  const at = photos.findIndex((p) => p._key === state.current.key);
  for (let step = 1; step <= photos.length; step++) {
    const photo = photos[(at + step + photos.length) % photos.length];
    if (photo._key !== state.current.key && !state.failed.includes(photo._key)) {
      return { key: photo._key, seq: state.current.seq + 1 };
    }
  }
  return null;
}

function advance(state: SlideshowState, next: Slide): SlideshowState {
  return { ...state, previous: state.current, current: next, waiting: false, loaded: state.loaded.filter((id) => id === slideId(next)) };
}

/** Advance if the next photo is ready (and not paused); otherwise wait. */
function advanceWhenReady(state: SlideshowState, photos: Photo[]): SlideshowState {
  if (state.paused) return state;
  const next = nextSlide(state, photos);
  if (!next) return { ...state, waiting: false };
  return state.loaded.includes(slideId(next)) ? advance(state, next) : { ...state, waiting: true };
}

export function slideshowReducer(state: SlideshowState, action: SlideshowAction): SlideshowState {
  switch (action.type) {
    case "tick":
      return advanceWhenReady(state, action.photos);
    case "loaded": {
      const loaded = state.loaded.includes(action.id) ? state.loaded : [...state.loaded, action.id];
      const next = { ...state, loaded };
      return state.waiting ? advanceWhenReady(next, action.photos) : next;
    }
    case "failed": {
      if (state.failed.includes(action.key)) return state;
      const next = { ...state, failed: [...state.failed, action.key] };
      // A broken current photo is replaced as soon as the next one is ready.
      return state.waiting || action.key === state.current.key ? advanceWhenReady(next, action.photos) : next;
    }
    case "pause":
      return { ...state, paused: true };
    case "resume": {
      const next = { ...state, paused: false };
      // If the timer already fired, show the next photo as soon as it's ready.
      return state.waiting ? advanceWhenReady(next, action.photos) : next;
    }
  }
}
