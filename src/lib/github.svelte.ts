import ls from 'localstorage-slim';

export interface RepoInfo {
    name: string;
    description: string | null;
    language: string | null;
    url: string;
    loaded: boolean;
}

interface GitHubRepoResponse {
    name: string;
    description: string | null;
    language: string | null;
    html_url: string;
}

export const repoCache: Record<string, RepoInfo> = $state({});

const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

function _cacheKey(slug: string): string {
    return `gh_repo:${slug}`;
}

function readCache(slug: string): RepoInfo | null {
    return ls.get<RepoInfo>(_cacheKey(slug));
}

function writeCache(slug: string, data: RepoInfo): void {
    try {
        ls.set(_cacheKey(slug), data, { ttl: CACHE_TTL_SECONDS });
    } catch {
        // sessionStorage full or unavailable
    }
}

async function fetchRepo(slug: string, owner: string): Promise<void> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${slug}`);
    if (!res.ok) {
        throw new Error(`${res.status}`);
    }

    const data = (await res.json()) as GitHubRepoResponse;
    const info: RepoInfo = {
        name: data.name,
        description: data.description,
        language: data.language,
        url: data.html_url,
        loaded: true,
    };
    repoCache[slug] = info;
    writeCache(slug, info);
}

export function fetchRepos(
    slugs: string[],
    owner: string,
    baseUrl: string,
): void {
    const toFetch: string[] = [];

    // Read from cache
    for (const slug of slugs) {
        const maybeCached = readCache(slug);

        if (maybeCached) {
            repoCache[slug] = maybeCached;
            continue;
        }

        // Placeholder while loading
        repoCache[slug] = {
            name: slug,
            description: null,
            language: null,
            url: `${baseUrl}${slug}`,
            loaded: false,
        };
        toFetch.push(slug);
    }

    // Fetch in parallel
    for (const slug of toFetch) {
        void fetchRepo(slug, owner);
    }
}
