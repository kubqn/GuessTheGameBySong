const prefetched = new Map<string, HTMLAudioElement>()
const loading = new Set<string>()

let onPendingChange: ((pending: number) => void) | null = null

export const watchPrefetchProgress = (
  listener: ((pending: number) => void) | null
) => {
  onPendingChange = listener
}

const report = () => onPendingChange?.(loading.size)

const settle = (url: string) => {
  loading.delete(url)
  report()
}

const release = (url: string) => {
  const audio = prefetched.get(url)
  if (audio) {
    audio.oncanplaythrough = null
    audio.onerror = null
    audio.removeAttribute('src')
    audio.load()
  }
  prefetched.delete(url)
  loading.delete(url)
}

/**
 * @param urls every clip worth keeping warm; anything else is dropped
 * @param skipUrl the clip the player element is already loading, so it is not fetched twice
 */
export const prefetchAudioClips = (urls: string[], skipUrl: string) => {
  for (const url of [...prefetched.keys()]) {
    if (!urls.includes(url)) {
      release(url)
    }
  }

  for (const url of urls) {
    if (url === skipUrl || prefetched.has(url)) {
      continue
    }
    const audio = new Audio()
    audio.preload = 'auto'
    audio.oncanplaythrough = () => settle(url)
    audio.onerror = () => {
      prefetched.delete(url)
      settle(url)
    }
    audio.src = url
    audio.load()
    prefetched.set(url, audio)
    loading.add(url)
  }
  report()
}

export const clearPrefetchedAudio = () => {
  for (const url of [...prefetched.keys()]) {
    release(url)
  }
  report()
}
