import './css/musicplayer.css'
import { useState, useRef, useEffect } from 'react'
import { FaVolumeUp } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { RoundInformation } from '../store/reducer'
import { setIsPlaying } from '../store/actions'

const MusicPlayer = () => {
  const dispatch = useDispatch()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(1)
  const [volume, setVolume] = useState(
    () => Number(localStorage.getItem('volume')) || 1
  )
  const [startDurations, setStartDurations] = useState<Map<number, number>>(
    new Map()
  )

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressBarRef = useRef<HTMLInputElement | null>(null)
  const volumeBarRef = useRef<HTMLInputElement | null>(null)

  const activeIndex = useSelector((state: RootState) => state.app.activeIndex)
  const index = useSelector((state: RootState) => state.app.index)
  const round = useSelector((state: RootState) => state.app.round)
  const isPlaying = useSelector((state: RootState) => state.app.isPlaying)
  const attemptNumber = useSelector(
    (state: RootState) => state.app.attemptNumber
  )

  const isCorrectAnswer = useSelector(
    (state: RootState) => state.app.isCorrectAnswer
  )
  const roundInformation = useSelector(
    (state: RootState) => state.app.roundInformation as RoundInformation[]
  )

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current) {
      const songUrl =
        roundInformation !== null
          ? roundInformation[index ?? 0]?.songList[activeIndex ?? 0]
          : ''
      if (songUrl) {
        audioRef.current.src = songUrl
        audioRef.current.load()
      } else {
        audioRef.current.src = ''
      }
      setCurrentTime(0)
      if (progressBarRef.current) {
        progressBarRef.current.value = '0'
      }
    }
  }, [activeIndex, round, roundInformation])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current) {
      const songUrl = roundInformation[index]?.songList[activeIndex] || ''
      audioRef.current.src = songUrl
      audioRef.current.load()
      setCurrentTime(0)
      if (progressBarRef.current) {
        progressBarRef.current.value = '0'
      }
    }
  }, [activeIndex, index, round, roundInformation])

  useEffect(() => {
    if (audioRef.current) {
      if (
        !isCorrectAnswer &&
        attemptNumber !== 4 &&
        audioRef.current.duration
      ) {
        if (!startDurations.has(activeIndex)) {
          const randomStart = Math.random() * (audioRef.current.duration - 20)
          setStartDurations(
            new Map(startDurations.set(activeIndex, randomStart))
          )
          audioRef.current.currentTime = randomStart
        } else {
          audioRef.current.currentTime = startDurations.get(activeIndex) ?? 0
        }
        setDuration(20)
      } else {
        setDuration(audioRef.current.duration || 1)
      }
    }
  }, [audioRef.current?.duration, isCorrectAnswer, activeIndex, startDurations])

  const togglePlayPause = () => {
    if (audioRef.current) {
      const songUrl = audioRef.current.src
      if (!songUrl) {
        console.error('No audio source available')
        return
      }
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error)
          dispatch(setIsPlaying(false))
        })
      }
      dispatch(setIsPlaying(!isPlaying))
    }
  }

  const updateProgress = () => {
    if (audioRef.current && progressBarRef.current) {
      const current = audioRef.current.currentTime
      const effectiveDuration =
        isCorrectAnswer || attemptNumber === 4 ? duration : 20
      const startOffset =
        isCorrectAnswer || attemptNumber === 4
          ? 0
          : startDurations.get(activeIndex) ?? 0

      if (
        !isCorrectAnswer &&
        attemptNumber !== 4 &&
        current >= startOffset + 20
      ) {
        audioRef.current.pause()
        dispatch(setIsPlaying(false))
        audioRef.current.currentTime = startOffset
      }
      progressBarRef.current.value = (
        ((current - startOffset) / effectiveDuration) *
        100
      ).toString()
      setCurrentTime(current)
    }
  }

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      if (isCorrectAnswer || attemptNumber === 4) {
        setDuration(audioRef.current.duration)
      } else {
        setDuration(20)
        if (!startDurations.has(activeIndex)) {
          const randomStart = Math.random() * (audioRef.current.duration - 20)
          setStartDurations(
            new Map(startDurations.set(activeIndex, randomStart))
          )
          audioRef.current.currentTime = randomStart
        } else {
          audioRef.current.currentTime = startDurations.get(activeIndex) ?? 0
        }
      }
    }
  }

  const onChangeProgressBar = () => {
    if (audioRef.current && progressBarRef.current) {
      const newTime =
        (progressBarRef.current.valueAsNumber / 100) *
        (isCorrectAnswer || attemptNumber === 4 ? duration : 20)
      audioRef.current.currentTime =
        isCorrectAnswer || attemptNumber === 4
          ? newTime
          : (startDurations.get(activeIndex) ?? 0) + newTime
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const onChangeVolumeBar = () => {
    if (audioRef.current && volumeBarRef.current) {
      const newVolume = volumeBarRef.current.valueAsNumber / 100
      audioRef.current.volume = newVolume
      setVolume(newVolume)
      localStorage.setItem('volume', newVolume.toString())
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  return (
    <div className='music-player'>
      <audio
        ref={audioRef}
        onTimeUpdate={updateProgress}
        onLoadedMetadata={onLoadedMetadata}
      />
      <input
        type='range'
        ref={progressBarRef}
        defaultValue='0'
        onChange={onChangeProgressBar}
      />
      <div className='time'>
        <span>
          {isCorrectAnswer || attemptNumber === 4
            ? formatTime(currentTime)
            : `0:${Math.max(
                0,
                Math.floor(
                  (currentTime - (startDurations.get(activeIndex) ?? 0)) % 60
                )
              )
                .toString()
                .padStart(2, '0')}`}
        </span>
        <span>
          {isCorrectAnswer || attemptNumber === 4
            ? formatTime(duration)
            : '0:20'}
        </span>
      </div>
      <button className='button-common' onClick={togglePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <div className='volume-control'>
        <FaVolumeUp size={40} style={{ cursor: 'default' }} />
        <input
          type='range'
          ref={volumeBarRef}
          defaultValue={volume * 100}
          onChange={onChangeVolumeBar}
        />
      </div>
      <div>Volume: {Math.round(volume * 100)}%</div>
    </div>
  )
}

export default MusicPlayer
