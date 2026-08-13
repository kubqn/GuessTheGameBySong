export enum RequestStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

export enum PageAnimation {
  Left = 'left',
  Right = 'right',
  Appear = 'appear',
}

export enum GamePhase {
  Bootstrapping = 'bootstrapping',
  ChoosingMode = 'choosingMode',
  Playing = 'playing',
}

export enum RoundOutcome {
  Solved = 'solved',
  Missed = 'missed',
  Skipped = 'skipped',
}
