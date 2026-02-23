export interface UnsplashPhoto {
  url: string;
  alt: string;
  photographer: string;
}

interface UnsplashSearchResult {
  urls: { regular: string };
  alt_description: string | null;
  user: { name: string };
}

interface UnsplashSearchResponse {
  results: UnsplashSearchResult[];
}

export async function searchPhotos(query: string): Promise<UnsplashPhoto | null> {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) return null;

    const params = new URLSearchParams({
      query,
      orientation: "landscape",
      per_page: "1",
    });

    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params.toString()}`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as UnsplashSearchResponse;

    if (!data.results || data.results.length === 0) return null;

    const photo = data.results[0];
    return {
      url: photo.urls.regular,
      alt: photo.alt_description ?? "",
      photographer: photo.user.name,
    };
  } catch {
    return null;
  }
}
