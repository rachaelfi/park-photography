/**
 * Reads gallery folders from Cloudinary at build time.
 *
 * Nothing here runs in the browser: the API key and secret are only ever
 * available to the build, and only delivery URLs are shipped to the client.
 */

export interface Photo {
    id: string;
    alt: string;
    ratio: number;
    tags: string[];
  }
  
  const nodeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } })
  .process?.env;

const env = (key: string): string | undefined =>
  import.meta.env?.[key] ?? nodeEnv?.[key];
  
  const CLOUD_NAME = env('PUBLIC_CLOUDINARY_CLOUD_NAME');
  const API_KEY = env('CLOUDINARY_API_KEY');
  const API_SECRET = env('CLOUDINARY_API_SECRET');
  
  interface CloudinaryResource {
    public_id: string;
    display_name?: string;
    width: number;
    height: number;
    context?: { custom?: Record<string, string> } & Record<string, unknown>;
    tags?: string[];
  }
  
  /** One fetch per folder per build, however many pages ask for it. */
  const cache = new Map<string, Promise<Photo[]>>();
  
  async function search(expression: string): Promise<CloudinaryResource[]> {
    const auth = btoa(`${API_KEY}:${API_SECRET}`);
    const results: CloudinaryResource[] = [];
    let cursor: string | undefined;
  
    do {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            expression: `${expression} AND resource_type:image`,
            max_results: 100,
            with_field: ['context', 'tags'],
            next_cursor: cursor,
          }),
        },
      );
  
      if (!response.ok) {
        throw new Error(
          `Cloudinary search failed (${response.status}) for: ${expression}`,
        );
      }
  
      const body = (await response.json()) as {
        resources?: CloudinaryResource[];
        next_cursor?: string;
      };
  
      results.push(...(body.resources ?? []));
      cursor = body.next_cursor;
    } while (cursor);
  
    return results;
  }
  
  function toPhoto(resource: CloudinaryResource, fallbackAlt: string): Photo {
    const context = {
      ...(resource.context ?? {}),
      ...(resource.context?.custom ?? {}),
    } as Record<string, string>;
  
    return {
      id: resource.public_id,
      // Alt text is editable in Cloudinary itself: open a photo, add a context
      // field named alt (or caption). Falls back to something generic.
      alt: context.alt ?? context.caption ?? fallbackAlt,
      ratio: Math.round((resource.width / resource.height) * 1000) / 1000,
      tags: resource.tags ?? [],
    };
  }
  
  /** Display name in dynamic folder mode, public ID otherwise. */
  function sortKey(resource: CloudinaryResource): string {
    return resource.display_name ?? resource.public_id;
  }
  
  /**
   * Every image in a Cloudinary folder, ordered by name.
   *
   * Prefix filenames with numbers (01-sunrise.jpg, 02-dunes.jpg) to control the
   * order photos appear in a gallery.
   */
  export async function photosInFolder(
    folder: string,
    fallbackAlt = 'Photograph by Park Photography',
  ): Promise<Photo[]> {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.warn(
        `[cloudinary] Missing credentials — "${folder}" will render empty.\n` +
          `            Set PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.`,
      );
      return [];
    }
  
    const cached = cache.get(folder);
    if (cached) return cached;
  
    const promise = (async () => {
      // Accounts created after June 2024 use dynamic folder mode, where the
      // Media Library folder is asset_folder and is independent of the public
      // ID. Older accounts use fixed folders, where the path is the public ID.
      // Try the modern field first, fall back to the legacy one.
      let resources = await search(`asset_folder="${folder}"`);
  
      if (resources.length === 0) {
        resources = await search(`folder="${folder}"`);
      }
  
      if (resources.length === 0) {
        console.warn(`[cloudinary] No images found in "${folder}".`);
      }
  
      return resources
        .sort((a, b) =>
          sortKey(a).localeCompare(sortKey(b), undefined, { numeric: true }),
        )
        .map((resource) => toPhoto(resource, fallbackAlt));
    })();
  
    cache.set(folder, promise);
    return promise;
  }
  
  /** First image in a folder — used for gallery covers and the About portrait. */
  export async function firstInFolder(
    folder: string,
    fallbackAlt?: string,
  ): Promise<Photo | undefined> {
    const photos = await photosInFolder(folder, fallbackAlt);
    return photos[0];
  }