const MAX_PARALLEL_WARMS = 2

const inFlight = new Map<string, AbortController>()
const queued = new Set<string>()
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

const report = () => {
  const pending = inFlight.size + queued.size
  listeners.forEach((listener) => listener(pending))
}

const drop = (url: string) => {
  queued.delete(url)
  inFlight.get(url)?.abort()
  inFlight.delete(url)
  const objectUrl = warmed.get(url)
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
  }
  warmed.delete(url)
}

const releaseToPlayer = (url: string) => {
  queued.delete(url)
  if (warmed.has(url)) {
    return
  }
  inFlight.get(url)?.abort()
  inFlight.delete(url)
}

const pumpQueue = () => {
  for (const url of queued) {
    if (inFlight.size >= MAX_PARALLEL_WARMS) {
      return
    }
    queued.delete(url)
    void warm(url)
  }
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
    const objectUrl = URL.createObjectURL(await response.blob())
    if (inFlight.get(url) === controller) {
      warmed.set(url, objectUrl)
    } else {
      URL.revokeObjectURL(objectUrl)
    }
  } catch {
    warmed.delete(url)
  } finally {
    if (inFlight.get(url) === controller) {
      inFlight.delete(url)
    }
    pumpQueue()
    report()
  }
}

export const prefetchAudioClips = (urls: string[], skipUrl: string) => {
  for (const url of [...inFlight.keys(), ...queued, ...warmed.keys()]) {
    if (!urls.includes(url)) {
      drop(url)
    }
  }

  releaseToPlayer(skipUrl)

  for (const url of urls) {
    if (
      url === skipUrl ||
      warmed.has(url) ||
      inFlight.has(url) ||
      queued.has(url)
    ) {
      continue
    }
    queued.add(url)
  }

  pumpQueue()
  report()
}

export const resolveWarmUrl = (url: string) => warmed.get(url) ?? url

export const clearPrefetchedAudio = () => {
  for (const url of [...inFlight.keys(), ...queued, ...warmed.keys()]) {
    drop(url)
  }
  report()
}
