import { useEffect, useState } from 'react'
import { shuffle } from './others/shuffle'

interface ImageData {
  src: string
  width: number
  height: number
  top: number
  left: number
}

const images = Object.values(
  import.meta.glob('../images/*.{png,jpg,jpeg,PNG,JPEG}', {
    eager: true,
    as: 'url',
  })
)
let shuffledImages = shuffle(images)

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

  const placeImages = () => {
    const containerWidth = window.innerWidth
    const containerHeight = window.innerHeight
    const placedImages: ImageData[] = []

    shuffledImages.forEach((src) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        const width = img.width
        const height = img.height

        if (width > containerWidth || height > containerHeight) {
          return
        }

        let position: any
        let hasCollision
        let attempts = 0
        const maxAttempts = 300

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
          if (attempts > maxAttempts) {
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

        if (widthDifference < 100 && heightDifference < 100) {
          return
        }

        setWindowSize({
          width: newWidth,
          height: newHeight,
        })
        placeImages()
      }, 1000)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [windowSize])

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
