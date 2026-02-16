export interface RepoInfo {
    name: string;
    description: string | null;
    language: string | null;
    url: string;
    loaded: boolean;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function cacheKey(slug: string): string {
    return `gh_repo:${slug}`;
}

function readCache(slug: string): RepoInfo | null {
    try {
        const raw = sessionStorage.getItem(cacheKey(slug));
        if (!raw) {
            return null;
        }
        const entry = JSON.parse(raw) as { data: RepoInfo; ts: number };
        if (Date.now() - entry.ts > CACHE_TTL) {
            sessionStorage.removeItem(cacheKey(slug));
            return null;
        }
        return entry.data;
    } catch {
        return null;
    }
}

function writeCache(slug: string, data: RepoInfo): void {
    try {
        sessionStorage.setItem(cacheKey(slug), JSON.stringify({ data, ts: Date.now() }));
    } catch {
        // sessionStorage full or unavailable
    }
}

export const repoCache: Record<string, RepoInfo> = $state({});

export function fetchRepos(slugs: string[], owner: string, baseUrl: string): void {
    const toFetch: string[] = [];

    for (const slug of slugs) {
        const cached = readCache(slug);
        if (cached) {
            repoCache[slug] = cached;
        } else {
            // placeholder while loading
            repoCache[slug] = {
                name: slug,
                description: null,
                language: null,
                url: `${baseUrl}${slug}`,
                loaded: false,
            };
            toFetch.push(slug);
        }
    }

    for (const slug of toFetch) {
        fetch(`https://api.github.com/repos/${owner}/${slug}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`${res.status}`);
                }
                return res.json() as Promise<{
                    name: string;
                    description: string | null;
                    language: string | null;
                    html_url: string;
                }>;
            })
            .then((data) => {
                const info: RepoInfo = {
                    name: data.name,
                    description: data.description,
                    language: data.language,
                    url: data.html_url,
                    loaded: true,
                };
                repoCache[slug] = info;
                writeCache(slug, info);
            })
            .catch(() => {
                // placeholder already set, nothing to do
            });
    }
}
