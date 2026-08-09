import './css/musicplayer.css'
import { useState, useRef, useEffect } from 'react'
import { FaVolumeUp } from 'react-icons/fa'
import { setIsPlaying } from '../store/actions'
import { audioUrl } from '../api'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  selectActiveIndex,
  selectAllUnlocked,
  selectClipTimes,
  selectGameEnded,
  selectGameId,
  selectIsPlaying,
  selectRound,
  selectRoundCompleted,
  selectServableSongIndexes,
} from '../store/selectors'
import { readStoredNumber, StorageKey, writeStored } from '../storage'
import { clearPrefetchedAudio, prefetchAudioClips } from './others/audioPrefetch'

const FALLBACK_CLIP_SECONDS = 20
const SECONDS_PER_MINUTE = 60
const SECONDS_PADDING = 2
const PERCENT_MAX = 100
const MS_PER_SECOND = 1000
const SEEK_SAFETY_SECONDS = 1
const MAX_VOLUME = 1
const VOLUME_ICON_SIZE = 40

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
  const [duration, setDuration] = useState(FALLBACK_CLIP_SECONDS)
  const [loadFailed, setLoadFailed] = useState(false)
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
  const gameEnded = useAppSelector(selectGameEnded)
  const servableIndexes = useAppSelector(selectServableSongIndexes)
  const allUnlocked = useAppSelector(selectAllUnlocked)
  const roundCompleted = useAppSelector(selectRoundCompleted)
  const clipTimes = useAppSelector(selectClipTimes)

  const playFull = allUnlocked || roundCompleted
  const source = gameId ? audioUrl(gameId, activeIndex, round, playFull) : ''

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
    if (!gameId || gameEnded) {
      clearPrefetchedAudio()
      return
    }
    const clips = servableIndexes.map((index) => audioUrl(gameId, index, round))
    const full = servableIndexes.map((index) =>
      audioUrl(gameId, index, round, true)
    )
    prefetchAudioClips([...clips, ...full], source)
  }, [gameId, gameEnded, round, servableIndexes, source])

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
    audio.src = source
    if (source) {
      audio.load()
    }
  }, [source])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !source) {
      return
    }
    if (isPlaying) {
      audio.play().catch(() => dispatch(setIsPlaying(false)))
    } else {
      audio.pause()
    }
  }, [isPlaying, source, dispatch])

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
    setDuration(audio.duration || FALLBACK_CLIP_SECONDS)

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
        onTimeUpdate={updateProgress}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => dispatch(setIsPlaying(false))}
        onError={() => {
          if (source) {
            setLoadFailed(true)
            dispatch(setIsPlaying(false))
          }
        }}
      />
      <input
        type='range'
        ref={progressBarRef}
        defaultValue='0'
        onChange={onChangeProgressBar}
      />
      <div className='time'>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <button
        className='button-common'
        disabled={!source || loadFailed}
        onClick={() => dispatch(setIsPlaying(!isPlaying))}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      {loadFailed && <div>Could not load this clip from the server.</div>}
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
