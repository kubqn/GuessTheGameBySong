const prefetched = new Map<string, HTMLAudioElement>()

const release = (url: string) => {
  const audio = prefetched.get(url)
  if (audio) {
    audio.onerror = null
    audio.removeAttribute('src')
    audio.load()
  }
  prefetched.delete(url)
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
    audio.onerror = () => prefetched.delete(url)
    audio.src = url
    audio.load()
    prefetched.set(url, audio)
  }
}

export const clearPrefetchedAudio = () => {
  for (const url of [...prefetched.keys()]) {
    release(url)
  }
}
