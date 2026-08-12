import { useEffect, useRef, useState } from 'react'
import { shuffle } from './others/shuffle'
import { useAppSelector } from '../store/hooks'
import { selectRound, selectSettings } from '../store/selectors'

interface Rect {
  width: number
  height: number
  top: number
  left: number
}

interface SizedImage {
  src: string
  width: number
  height: number
}

interface ImageData extends SizedImage, Rect {}

const allImages = Object.values(
  import.meta.glob('../images/*.{png,jpg,jpeg,PNG,JPEG}', {
    eager: true,
    as: 'url',
  })
)

const MAX_PLACEMENT_ATTEMPTS = 300
const RESIZE_DEBOUNCE_MS = 1000
const RESIZE_THRESHOLD_PX = 100
const CONCURRENT_LOADS = 6
const MAX_WIDTH_FRACTION = 0.22
const MAX_HEIGHT_FRACTION = 0.3
const GRID_STEP_PX = 40

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })

const generateRandomPosition = (
  width: number,
  height: number,
  containerWidth: number,
  containerHeight: number
) => {
  const top = Math.random() * (containerHeight - height)
  const left = Math.random() * (containerWidth - width)
  return { top, left }
}

const scaleToFit = (
  img: HTMLImageElement,
  containerWidth: number,
  containerHeight: number
): SizedImage => {
  const factor = Math.min(
    1,
    (containerWidth * MAX_WIDTH_FRACTION) / img.naturalWidth,
    (containerHeight * MAX_HEIGHT_FRACTION) / img.naturalHeight
  )
  return {
    src: img.src,
    width: Math.round(img.naturalWidth * factor),
    height: Math.round(img.naturalHeight * factor),
  }
}

const checkCollision = (img1: Rect, img2: Rect) => {
  return !(
    img1.left + img1.width < img2.left ||
    img1.left > img2.left + img2.width ||
    img1.top + img1.height < img2.top ||
    img1.top > img2.top + img2.height
  )
}

const findRandomSpot = (
  candidate: SizedImage,
  containerWidth: number,
  containerHeight: number,
  placed: ImageData[]
) => {
  for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
    const position = generateRandomPosition(
      candidate.width,
      candidate.height,
      containerWidth,
      containerHeight
    )
    const fits = !placed.some((image) =>
      checkCollision(image, { ...position, ...candidate })
    )
    if (fits) {
      return position
    }
  }
  return null
}

const findGridSpot = (
  candidate: SizedImage,
  containerWidth: number,
  containerHeight: number,
  placed: ImageData[]
) => {
  for (let top = 0; top + candidate.height <= containerHeight; top += GRID_STEP_PX) {
    for (let left = 0; left + candidate.width <= containerWidth; left += GRID_STEP_PX) {
      const fits = !placed.some((image) =>
        checkCollision(image, { top, left, ...candidate })
      )
      if (fits) {
        return { top, left }
      }
    }
  }
  return null
}

const Background = () => {
  const [images, setImages] = useState<ImageData[]>([])
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const round = useAppSelector(selectRound)
  const { shuffleBackground } = useAppSelector(selectSettings)
  const runIdRef = useRef(0)

  const placeImages = async () => {
    const runId = ++runIdRef.current
    const containerWidth = window.innerWidth
    const containerHeight = window.innerHeight
    const placedImages: ImageData[] = []
    const unplaced: SizedImage[] = []
    const queue = shuffle(allImages)

    setImages([])

    for (let start = 0; start < queue.length; start += CONCURRENT_LOADS) {
      const slice = queue.slice(start, start + CONCURRENT_LOADS)
      const loaded = await Promise.all(slice.map(loadImage))

      if (runId !== runIdRef.current) {
        return
      }

      for (const img of loaded) {
        if (!img) {
          continue
        }
        const candidate = scaleToFit(img, containerWidth, containerHeight)

        if (
          candidate.width > containerWidth ||
          candidate.height > containerHeight
        ) {
          continue
        }

        const position = findRandomSpot(
          candidate,
          containerWidth,
          containerHeight,
          placedImages
        )
        if (position) {
          placedImages.push({ ...candidate, ...position })
        } else {
          unplaced.push(candidate)
        }
      }

      setImages([...placedImages])
    }

    unplaced.sort((a, b) => a.width * a.height - b.width * b.height)
    let filled = false
    for (const candidate of unplaced) {
      const position = findGridSpot(
        candidate,
        containerWidth,
        containerHeight,
        placedImages
      )
      if (position) {
        placedImages.push({ ...candidate, ...position })
        filled = true
      }
    }
    if (filled) {
      setImages([...placedImages])
    }
  }

  useEffect(() => {
    placeImages()

    let resizeTimeout: number

    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(() => {
        const newWidth = window.innerWidth
        const newHeight = window.innerHeight
        const widthDifference = Math.abs(newWidth - windowSize.width)
        const heightDifference = Math.abs(newHeight - windowSize.height)

        if (
          widthDifference < RESIZE_THRESHOLD_PX &&
          heightDifference < RESIZE_THRESHOLD_PX
        ) {
          return
        }

        setWindowSize({
          width: newWidth,
          height: newHeight,
        })
        placeImages()
      }, RESIZE_DEBOUNCE_MS)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [windowSize])

  const firstRunRef = useRef(true)
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false
      return
    }
    if (shuffleBackground) {
      placeImages()
    }
  }, [round, shuffleBackground])

  return (
    <div
      className='background-container'
      aria-hidden='true'
      style={{
        overflow: 'hidden',
      }}
    >
      {images.map((img, index) => (
        <img
          key={index}
          src={img.src}
          alt=''
          loading='lazy'
          decoding='async'
          width={img.width}
          height={img.height}
          style={{
            position: 'absolute',
            top: img.top,
            left: img.left,
            width: img.width,
            height: img.height,
            zIndex: -1,
          }}
        />
      ))}
    </div>
  )
}

export default Background
