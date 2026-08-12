import { useEffect, useState } from 'react'

const NO_HOVER = '(hover: none)'

const matchNoHover = (): MediaQueryList | null =>
  typeof window.matchMedia === 'function' ? window.matchMedia(NO_HOVER) : null

const useCoarsePointer = () => {
  const [coarse, setCoarse] = useState(() => matchNoHover()?.matches ?? false)

  useEffect(() => {
    const media = matchNoHover()
    if (!media) {
      return
    }
    const update = () => setCoarse(media.matches)
    update()
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }
    if (typeof media.addListener === 'function') {
      media.addListener(update)
      return () => media.removeListener(update)
    }
  }, [])

  return coarse
}

export default useCoarsePointer
