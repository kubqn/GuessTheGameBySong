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
    report()
  }
}

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

export const resolveWarmUrl = (url: string) => warmed.get(url) ?? url

export const clearPrefetchedAudio = () => {
  for (const url of [...inFlight.keys(), ...warmed.keys()]) {
    drop(url)
  }
  report()
}
