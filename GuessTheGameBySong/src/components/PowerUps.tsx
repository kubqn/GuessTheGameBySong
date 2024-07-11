import { FaForward } from 'react-icons/fa'
import {
  FaHeartCirclePlus,
  FaHeartCircleXmark,
  FaShieldHeart,
  FaMusic,
} from 'react-icons/fa6'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import { PowerUpsInterface } from '../store/reducer'
import { setLife, setPowerUps } from '../store/actions'
import { motion } from 'framer-motion'

type powerUpProps = {
  handleNextRound: () => void
}

const ICON_SIZE = 50

const PowerUps = ({ handleNextRound }: powerUpProps) => {
  const dispatch = useDispatch()
  const powerUps = useSelector(
    (state: RootState) => state.app.powerUps as PowerUpsInterface
  )
  const life = useSelector((state: RootState) => state.app.life)
  const isCorrectAnswer = useSelector(
    (state: RootState) => state.app.isCorrectAnswer
  )

  const powerUpList = [
    {
      icon:
        powerUps.points > 0 ? (
          <FaHeartCirclePlus size={ICON_SIZE} />
        ) : (
          <FaHeartCircleXmark size={ICON_SIZE} />
        ),
      text: 'Restore 1 health',
      onClick: () => {
        if (life < 5) {
          dispatch(
            setPowerUps({
              ...powerUps,
              points: powerUps.points - 1,
            })
          )
          dispatch(setLife(life + 1))
        }
      },
    },
    {
      icon: <FaForward size={ICON_SIZE} />,
      text: 'Allows you to go to the next round without losing health',
      onClick: () => {
        if (powerUps.points) {
          handleNextRound()
          dispatch(
            setPowerUps({
              ...powerUps,
              points: powerUps.points - 1,
            })
          )
        }
      },
    },
    {
      icon: <FaMusic size={ICON_SIZE} />,
      text: 'Unlocks all 3 songs for this round, without losing attempts and health',
      onClick: () => {
        if (!powerUps.unlockedButtons) {
          dispatch(
            setPowerUps({
              ...powerUps,
              points: powerUps.points - 1,
              unlockedButtons: true,
            })
          )
        }
      },
      animation: powerUps.unlockedButtons
        ? {
            animate: {
              color: ['#000000', '#ff0000'],
              opacity: [1, 0.8, 1],
              scale: [1],
            },
            transition: {
              duration: 3,
            },
          }
        : {},
    },
    {
      icon: <FaShieldHeart size={ICON_SIZE} />,
      text: powerUps.shield.isActive
        ? `${powerUps.shield.left} uses left`
        : `You will be protected in your next 3 guesses in this round (skip work normally), preventing both health loss and song unlock`,
      onClick: () => {
        if (!powerUps.shield.isActive) {
          dispatch(
            setPowerUps({
              ...powerUps,
              points: powerUps.points - 1,
              shield: {
                isActive: true,
                left: 3,
              },
            })
          )
        }
      },
      animation: powerUps.shield.isActive
        ? {
            animate: {
              color: ['#000000', '#ff0000', '#000000'],
              opacity: [1, 0.8, 1],
              scale: [0.8, 0.9, 1],
            },
            transition: {
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse' as 'reverse',
            },
          }
        : {},
    },
  ]

  return (
    <>
      <h2 style={{ marginTop: '20px' }}>Power Points [{powerUps.points}]</h2>
      {powerUpList.map((button, index) => {
        return (
          <motion.button
            initial={{ color: '#000000', opacity: 1, scale: 1 }}
            animate={button.animation?.animate}
            transition={button.animation?.transition}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            key={index}
            disabled={powerUps.points <= 0 || isCorrectAnswer}
            className='button-common'
            style={
              powerUps.points > 0 && !isCorrectAnswer
                ? { height: 'auto' }
                : { height: 'auto', cursor: 'not-allowed' }
            }
            onClick={button.onClick}
          >
            {button.icon}
            <div className='tooltip-text'>{button.text}</div>
          </motion.button>
        )
      })}
      <div>Hover icon for detail</div>
    </>
  )
}

export default PowerUps
