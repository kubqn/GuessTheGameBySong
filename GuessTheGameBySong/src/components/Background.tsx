import { useEffect, useRef, useState } from 'react'
import { shuffle } from './others/shuffle'
import { useAppSelector } from '../store/hooks'
import { selectRound, selectSettings } from '../store/selectors'

interface ImageData {
  src: string
  width: number
  height: number
  top: number
  left: number
}

const allImages = Object.values(
  import.meta.glob('../images/*.{png,jpg,jpeg,PNG,JPEG}', {
    eager: true,
    as: 'url',
  })
)

const MAX_PLACEMENT_ATTEMPTS = 300
const RESIZE_DEBOUNCE_MS = 1000
const RESIZE_THRESHOLD_PX = 100

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

const checkCollision = (img1: ImageData, img2: ImageData) => {
  return !(
    img1.left + img1.width < img2.left ||
    img1.left > img2.left + img2.width ||
    img1.top + img1.height < img2.top ||
    img1.top > img2.top + img2.height
  )
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

  const placeImages = () => {
    const runId = ++runIdRef.current
    const containerWidth = window.innerWidth
    const containerHeight = window.innerHeight
    const placedImages: ImageData[] = []

    shuffle(allImages).forEach((src) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        if (runId !== runIdRef.current) {
          return
        }
        const width = img.width
        const height = img.height

        if (width > containerWidth || height > containerHeight) {
          return
        }

        let position: { top: number; left: number }
        let hasCollision
        let attempts = 0

        do {
          position = generateRandomPosition(
            width,
            height,
            containerWidth,
            containerHeight
          )
          hasCollision = placedImages.some((placedImg) =>
            checkCollision(placedImg, { ...position, width, height, src })
          )
          attempts++
          if (attempts > MAX_PLACEMENT_ATTEMPTS) {
            return
          }
        } while (hasCollision)

        placedImages.push({ src, width, height, ...position })
        setImages([...placedImages])
      }
    })
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
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, shuffleBackground])

  return (
    <div
      className='background-container'
      style={{
        overflow: 'hidden',
      }}
    >
      {images.map((img, index) => (
        <img
          key={index}
          src={img.src}
          alt='background'
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
