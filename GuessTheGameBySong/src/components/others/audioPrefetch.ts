const inFlight = new Map<string, AbortController>()
const warmed = new Map<string, string>()

const listeners = new Set<(pending: number) => void>()

export const watchPrefetchProgress = (
  listener: (pending: number) => void
) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const report = () => listeners.forEach((listener) => listener(inFlight.size))

const drop = (url: string) => {
  inFlight.get(url)?.abort()
  inFlight.delete(url)
  const objectUrl = warmed.get(url)
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
  }
  warmed.delete(url)
}

const warm = async (url: string) => {
  const controller = new AbortController()
  inFlight.set(url, controller)
  report()
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(String(response.status))
    }
    warmed.set(url, URL.createObjectURL(await response.blob()))
  } catch {
    warmed.delete(url)
  } finally {
    if (inFlight.get(url) === controller) {
      inFlight.delete(url)
    }
    report()
  }
}

/**
 * Holds whole files as blobs rather than leaning on the http cache. A media
 * element issues range requests that chrome will not answer from a cached
 * response, so warming the cache alone still leaves the player going to the
 * server - both to start and on every seek.
 *
 * @param urls every clip worth keeping warm; anything else is dropped
 * @param skipUrl the clip the player element is already loading, so it is not fetched twice
 */
export const prefetchAudioClips = (urls: string[], skipUrl: string) => {
  for (const url of [...inFlight.keys(), ...warmed.keys()]) {
    if (!urls.includes(url)) {
      drop(url)
    }
  }

  for (const url of urls) {
    if (url === skipUrl || warmed.has(url) || inFlight.has(url)) {
      continue
    }
    void warm(url)
  }
  report()
}

/** The local copy if we have one, otherwise the address it came from. */
export const resolveWarmUrl = (url: string) => warmed.get(url) ?? url

export const clearPrefetchedAudio = () => {
  for (const url of [...inFlight.keys(), ...warmed.keys()]) {
    drop(url)
  }
  report()
}
