/**
 * Galleries and photos.
 *
 * `id` is the Cloudinary public ID, including any folder path — exactly what
 * you see under Media Library > the file's "Public ID" field. No file extension.
 *
 * `ratio` is width / height. The justified grid uses it to lay rows out before
 * any image has loaded, so it must be roughly right or rows will jump. Portrait
 * images are less than 1 (2/3 = 0.667), landscape more than 1 (3/2 = 1.5).
 */

export interface Photo {
  id: string;
  alt: string;
  ratio: number;
}

export interface Gallery {
  slug: string;
  title: string;
  /** Sits under the title on the portfolio index. One line. */
  blurb: string;
  /** Longer intro at the top of the gallery page. */
  intro: string;
  cover: Photo;
  photos: Photo[];
}

export const galleries: Gallery[] = [
  {
    slug: 'nature',
    title: 'Nature',
    blurb: 'Dunes, ravines, and the lake in every season.',
    intro:
      'Landscape work made close to home — mostly before sunrise, mostly within an hour of the lake. Prints from this collection are available.',
    cover: {
      id: 'parkphotography/nature/cover',
      alt: 'Fog rolling over a stand of pines at dawn',
      ratio: 1.5,
    },
    photos: [
      { id: 'parkphotography/nature/01', alt: 'Fog over a pine ridge at first light', ratio: 1.5 },
      { id: 'parkphotography/nature/02', alt: 'Ice shelves along the Lake Michigan shoreline', ratio: 0.667 },
      { id: 'parkphotography/nature/03', alt: 'Prairie grass bending in evening wind', ratio: 1.5 },
      { id: 'parkphotography/nature/04', alt: 'A creek cutting through a wooded ravine', ratio: 0.8 },
      { id: 'parkphotography/nature/05', alt: 'Storm clouds gathering over open water', ratio: 1.78 },
      { id: 'parkphotography/nature/06', alt: 'Bare oak branches against a pale winter sky', ratio: 0.667 },
      { id: 'parkphotography/nature/07', alt: 'Sand dune ridge lit from the side at sunset', ratio: 1.5 },
      { id: 'parkphotography/nature/08', alt: 'Frost on fallen leaves', ratio: 1 },
    ],
  },
  {
    slug: 'portraits',
    title: 'Couple & family portraits',
    blurb: 'Unhurried sessions, outdoors, an hour or two before sunset.',
    intro:
      'Sessions run about ninety minutes and work best somewhere that already means something to you — a backyard, a trailhead, the block you grew up on.',
    cover: {
      id: 'parkphotography/portraits/cover',
      alt: 'A family of four walking a path through tall grass',
      ratio: 1.5,
    },
    photos: [
      { id: 'parkphotography/portraits/01', alt: 'A couple laughing on a wooded trail', ratio: 0.667 },
      { id: 'parkphotography/portraits/02', alt: 'Two parents lifting a toddler between them', ratio: 1.5 },
      { id: 'parkphotography/portraits/03', alt: 'Siblings sitting together on porch steps', ratio: 1.5 },
      { id: 'parkphotography/portraits/04', alt: 'Close portrait of a couple at golden hour', ratio: 0.8 },
      { id: 'parkphotography/portraits/05', alt: 'A family walking away down a sandy path', ratio: 1.78 },
      { id: 'parkphotography/portraits/06', alt: 'A grandmother holding a newborn by a window', ratio: 0.667 },
      { id: 'parkphotography/portraits/07', alt: 'Kids running through a sprinkler in a yard', ratio: 1.5 },
      { id: 'parkphotography/portraits/08', alt: 'A couple standing in shallow lake water', ratio: 1 },
    ],
  },
  {
    slug: 'weddings',
    title: 'Weddings',
    blurb: 'Full-day coverage, documentary in approach.',
    intro:
      'I photograph roughly fifteen weddings a year so each one gets real attention. Coverage starts at eight hours and includes a second photographer.',
    cover: {
      id: 'parkphotography/weddings/cover',
      alt: 'A bride and groom under string lights at dusk',
      ratio: 1.5,
    },
    photos: [
      { id: 'parkphotography/weddings/01', alt: 'First look in a hotel hallway', ratio: 0.667 },
      { id: 'parkphotography/weddings/02', alt: 'Guests throwing confetti after the ceremony', ratio: 1.5 },
      { id: 'parkphotography/weddings/03', alt: 'Detail of a bouquet resting on a chair', ratio: 1 },
      { id: 'parkphotography/weddings/04', alt: 'The couple dancing in a crowded reception hall', ratio: 1.5 },
      { id: 'parkphotography/weddings/05', alt: 'A quiet moment before the ceremony begins', ratio: 0.8 },
      { id: 'parkphotography/weddings/06', alt: 'Sparkler exit at the end of the night', ratio: 1.78 },
      { id: 'parkphotography/weddings/07', alt: 'A toast from the maid of honour', ratio: 1.5 },
      { id: 'parkphotography/weddings/08', alt: 'The couple walking a country road at dusk', ratio: 0.667 },
    ],
  },
];

/** Images that rotate in the home page hero. */
export const heroSlides: Photo[] = [
  { id: 'parkphotography/hero/01', alt: 'A couple on a bluff overlooking the lake at sunrise', ratio: 1.5 },
  { id: 'parkphotography/hero/02', alt: 'Wedding guests dancing under warm light', ratio: 1.5 },
  { id: 'parkphotography/hero/03', alt: 'A family walking together through tall prairie grass', ratio: 1.5 },
];

export function getGallery(slug: string): Gallery | undefined {
  return galleries.find((g) => g.slug === slug);
}
