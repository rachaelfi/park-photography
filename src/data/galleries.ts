import { photosInFolder, type Photo } from '../lib/cloudinary-assets';

export type { Photo };

/**
 * Galleries are defined by which Cloudinary folder they read from. The photos
 * themselves live in Cloudinary, not here — upload to the folder and they
 * appear on the next build.
 */
export interface GalleryDefinition {
  slug: string;
  title: string;
  /** One line, under the title on the portfolio index */
  blurb: string;
  /** Longer intro at the top of the gallery page */
  intro: string;
  /** Cloudinary folder, exactly as it reads in the Media Library */
  folder: string;
}

export interface Gallery extends GalleryDefinition {
  photos: Photo[];
  /** The photo tagged "cover" in Cloudinary, or the first one */
  cover?: Photo;
}

export const HERO_FOLDER = 'parkphotography/hero';
export const ABOUT_FOLDER = 'parkphotography/about';

export const galleryDefinitions: GalleryDefinition[] = [
  {
    slug: 'nature',
    title: 'Nature',
    blurb: '',
    intro:
      '',
    folder: 'parkphotography/nature',
  },
  {
    slug: 'portraits',
    title: 'Couple & family portraits',
    blurb: '',
    intro:
      'Proposals, engagements, and anniversary shoots. One hour, any number of outfits, and locations.',
    folder: 'parkphotography/portraits',
  },
  {
    slug: 'engagements',
    title: 'Engagements',
    blurb: '',
    intro:
      'Engagement sessions are the easiest way to get comfortable in front of a camera before the wedding day. Most run about an hour and end around sunset.',
    folder: 'parkphotography/engagements',
  },
  {
    slug: 'weddings',
    title: 'Weddings & bridals',
    blurb: '',
    intro:
      '',
    folder: 'parkphotography/weddings',
  },
  {
    slug: 'graduation',
    title: 'Graduation',
    blurb: '',
    intro:
      '',
    folder: 'parkphotography/graduation',
  },
];

export async function loadGallery(
  definition: GalleryDefinition,
): Promise<Gallery> {
  const photos = await photosInFolder(
    definition.folder,
    `${definition.title} photograph by Park Photography`,
  );

  return {
    ...definition,
    photos,
    cover: photos.find((photo) => photo.tags.includes('cover')) ?? photos[0],
  };
}

export async function loadGalleries(): Promise<Gallery[]> {
  return Promise.all(galleryDefinitions.map(loadGallery));
}