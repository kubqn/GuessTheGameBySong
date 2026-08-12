import { useEffect, useState } from 'react'

const NO_HOVER = '(hover: none)'

const useCoarsePointer = () => {
  const [coarse, setCoarse] = useState(
    () => window.matchMedia(NO_HOVER).matches
  )

  useEffect(() => {
    const media = window.matchMedia(NO_HOVER)
    const update = () => setCoarse(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return coarse
}

export default useCoarsePointer
