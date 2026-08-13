import './css/musicplayer.css'
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
} from 'react'
import { FaVolumeUp } from 'react-icons/fa'
import { FaArrowsRotate } from 'react-icons/fa6'
import { setIsPlaying } from '../store/actions'
import { audioUrl } from '../api'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  selectActiveIndex,
  selectAllUnlocked,
  selectClipTimes,
  selectGameId,
  selectIsPlaying,
  selectRound,
  selectRoundCompleted,
  selectServableSongIndexes,
  selectSettings,
} from '../store/selectors'
import { readStoredNumber, StorageKey, writeStored } from '../storage'
import {
  clearPrefetchedAudio,
  prefetchAudioClips,
  resolveWarmUrl,
} from './others/audioPrefetch'

const CLIP_SECONDS = 20
const SECONDS_PER_MINUTE = 60
const SECONDS_PADDING = 2
const PERCENT_MAX = 100
const MS_PER_SECOND = 1000
const SEEK_SAFETY_SECONDS = 1
const MAX_VOLUME = 1
const VOLUME_ICON_SIZE = 40
const RETRY_ICON_SIZE = 14
const MAX_LOAD_RETRIES = 3
const RETRY_DELAY_MS = 700
const MAX_DOTS = 3
const DOT_INTERVAL_MS = 400

const formatTime = (time: number) => {
  const minutes = Math.floor(time / SECONDS_PER_MINUTE)
  const seconds = Math.floor(time % SECONDS_PER_MINUTE)
    .toString()
    .padStart(SECONDS_PADDING, '0')
  return `${minutes}:${seconds}`
}

const MusicPlayer = () => {
  const dispatch = useAppDispatch()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(CLIP_SECONDS)
  const [loadFailed, setLoadFailed] = useState(false)
  const [refetching, setRefetching] = useState(false)
  const [dots, setDots] = useState(1)
  const [volume, setVolume] = useState(() =>
    readStoredNumber(StorageKey.Volume, MAX_VOLUME)
  )

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressBarRef = useRef<HTMLInputElement | null>(null)
  const volumeBarRef = useRef<HTMLInputElement | null>(null)

  const gameId = useAppSelector(selectGameId)
  const activeIndex = useAppSelector(selectActiveIndex)
  const round = useAppSelector(selectRound)
  const isPlaying = useAppSelector(selectIsPlaying)
  const servableIndexes = useAppSelector(selectServableSongIndexes)
  const allUnlocked = useAppSelector(selectAllUnlocked)
  const roundCompleted = useAppSelector(selectRoundCompleted)
  const clipTimes = useAppSelector(selectClipTimes)
  const { loopClip, reduceAnimations } = useAppSelector(selectSettings)

  const playFull = allUnlocked || roundCompleted
  const source = gameId ? audioUrl(gameId, activeIndex, round, playFull) : ''

  const [playbackSource, setPlaybackSource] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)

  const retriesRef = useRef(0)
  const retryTimerRef = useRef(0)

  const reloadClip = useCallback(() => {
    setPlaybackSource(source ? resolveWarmUrl(source) : '')
    setLoadAttempt((attempt) => attempt + 1)
  }, [source])

  useEffect(() => {
    clearTimeout(retryTimerRef.current)
    retriesRef.current = 0
    setRefetching(false)
    setPlaybackSource(source ? resolveWarmUrl(source) : '')
  }, [source])

  useEffect(() => () => clearTimeout(retryTimerRef.current), [])

  useEffect(() => {
    if (!refetching || reduceAnimations) {
      return
    }
    const ticker = window.setInterval(
      () => setDots((count) => (count % MAX_DOTS) + 1),
      DOT_INTERVAL_MS
    )
    return () => window.clearInterval(ticker)
  }, [refetching, reduceAnimations])

  const handleLoadError = () => {
    if (!playbackSource) {
      return
    }
    dispatch(setIsPlaying(false))
    if (retriesRef.current >= MAX_LOAD_RETRIES) {
      setRefetching(false)
      setLoadFailed(true)
      return
    }
    retriesRef.current += 1
    setRefetching(true)
    retryTimerRef.current = window.setTimeout(
      reloadClip,
      RETRY_DELAY_MS * retriesRef.current
    )
  }

  const handleManualRetry = () => {
    retriesRef.current = 0
    setLoadFailed(false)
    reloadClip()
  }

  const carryOverRef = useRef<{ index: number; time: number } | null>(null)
  const wasPlayingFull = useRef(playFull)

  useEffect(() => {
    if (playFull && !wasPlayingFull.current) {
      carryOverRef.current = {
        index: activeIndex,
        time: audioRef.current?.currentTime ?? 0,
      }
    }
    wasPlayingFull.current = playFull
  }, [playFull, activeIndex])

  useEffect(() => {
    if (!gameId) {
      clearPrefetchedAudio()
      return
    }
    const clips = servableIndexes.map((index) => audioUrl(gameId, index, round))
    const full = servableIndexes.map((index) =>
      audioUrl(gameId, index, round, true)
    )
    prefetchAudioClips([...clips, ...full], source)
  }, [gameId, round, servableIndexes, source])

  useEffect(() => clearPrefetchedAudio, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }
    setLoadFailed(false)
    setCurrentTime(0)
    if (progressBarRef.current) {
      progressBarRef.current.value = '0'
    }
    audio.src = playbackSource
    if (playbackSource) {
      audio.load()
    }
  }, [playbackSource, loadAttempt])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !playbackSource) {
      return
    }
    if (isPlaying) {
      audio.play().catch(() => dispatch(setIsPlaying(false)))
    } else {
      audio.pause()
    }
  }, [isPlaying, playbackSource, dispatch])

  const updateProgress = () => {
    if (audioRef.current && progressBarRef.current) {
      const current = audioRef.current.currentTime
      progressBarRef.current.value = (
        (current / duration) *
        PERCENT_MAX
      ).toString()
      setCurrentTime(current)
    }
  }

  const onLoadedMetadata = () => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) {
      return
    }
    retriesRef.current = 0
    setRefetching(false)
    setDuration(audio.duration || CLIP_SECONDS)

    if (!playFull) {
      return
    }
    const carried =
      carryOverRef.current?.index === activeIndex
        ? carryOverRef.current.time
        : 0
    carryOverRef.current = null

    const clipStart = clipTimes[activeIndex]
    if (!Number.isFinite(clipStart)) {
      return
    }

    const target = clipStart / MS_PER_SECOND + carried
    if (target > 0 && target < audio.duration - SEEK_SAFETY_SECONDS) {
      audio.currentTime = target
      setCurrentTime(target)
    }
  }

  const clipWindow = () => {
    const startMs = clipTimes[activeIndex]
    if (!playFull || !Number.isFinite(startMs) || duration <= 0) {
      return null
    }
    const start = ((startMs / MS_PER_SECOND) * PERCENT_MAX) / duration
    if (start >= PERCENT_MAX) {
      return null
    }
    return {
      start,
      end: Math.min(PERCENT_MAX, start + (CLIP_SECONDS * PERCENT_MAX) / duration),
    }
  }

  const clip = clipWindow()

  const onChangeProgressBar = () => {
    if (audioRef.current && progressBarRef.current) {
      const newTime =
        (progressBarRef.current.valueAsNumber / PERCENT_MAX) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const onChangeVolumeBar = () => {
    if (audioRef.current && volumeBarRef.current) {
      const newVolume = volumeBarRef.current.valueAsNumber / PERCENT_MAX
      audioRef.current.volume = newVolume
      setVolume(newVolume)
      writeStored(StorageKey.Volume, newVolume.toString())
    }
  }

  return (
    <div className='music-player'>
      <audio
        ref={audioRef}
        preload='auto'
        loop={loopClip}
        onTimeUpdate={updateProgress}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => dispatch(setIsPlaying(false))}
        onError={handleLoadError}
      />
      <input
        type='range'
        className={`progress-bar${clip ? ' has-clip-window' : ''}`}
        ref={progressBarRef}
        defaultValue='0'
        onChange={onChangeProgressBar}
        title={clip ? 'Highlighted: the clip you guessed from' : undefined}
        style={
          clip
            ? ({
                '--clip-start': `${clip.start}%`,
                '--clip-end': `${clip.end}%`,
              } as CSSProperties)
            : undefined
        }
      />
      <div className='time'>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <button
        className='button-common'
        disabled={!source || loadFailed || refetching}
        onClick={() => dispatch(setIsPlaying(!isPlaying))}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      {refetching && (
        <div className='clip-status' role='status'>
          Fetching this clip
          <span className='clip-dots'>
            {'.'.repeat(reduceAnimations ? MAX_DOTS : dots)}
          </span>
        </div>
      )}
      {loadFailed && (
        <div className='clip-status is-failed' role='alert'>
          <span>Could not load this clip from the server.</span>
          <button
            className='server-error-retry'
            onClick={handleManualRetry}
            aria-label='Retry'
            title='Retry'
          >
            <FaArrowsRotate size={RETRY_ICON_SIZE} />
          </button>
        </div>
      )}
      <div className='volume-control'>
        <FaVolumeUp size={VOLUME_ICON_SIZE} style={{ cursor: 'default' }} />
        <input
          type='range'
          ref={volumeBarRef}
          defaultValue={volume * PERCENT_MAX}
          onChange={onChangeVolumeBar}
        />
      </div>
      <div>Volume: {Math.round(volume * PERCENT_MAX)}%</div>
    </div>
  )
}

export default MusicPlayer
