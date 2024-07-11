type Round = {
  answer: string
  songList: string[]
}

export function shuffle<T>(innerArray: T[]): T[] {
  const newArray = innerArray.slice()
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function shuffleArray(array: Round[]): Round[] {
  const newArray = shuffle(array)

  const resultArray = newArray.map((item) => ({
    ...item,
    songList: shuffle(item.songList),
  }))

  return resultArray
}
