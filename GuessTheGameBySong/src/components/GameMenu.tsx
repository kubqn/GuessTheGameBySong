import './css/gamemenu.css'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaAngleDown } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { setAnimationType } from '../store/store'
import { PageAnimation } from '../store/types'

const CHEVRON_SIZE = 28
const EXPAND_SECONDS = 0.3

type ExitPrompt = 'none' | 'mode' | 'home'

type GameMenuProps = {
  onChangeMode: () => void
  onReturnHome: (abandonRun: boolean) => void
}

const GameMenu = ({ onChangeMode, onReturnHome }: GameMenuProps) => {
  const [open, setOpen] = useState(false)
  const [exitPrompt, setExitPrompt] = useState<ExitPrompt>('none')

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const close = () => {
    setExitPrompt('none')
    setOpen(false)
  }

  const goToSettings = () => {
    close()
    dispatch(setAnimationType(PageAnimation.Left))
    navigate('/settings')
  }

  const hiddenUnless = (prompt: ExitPrompt) =>
    exitPrompt === prompt ? '' : ' is-hidden'

  return (
    <div className='game-menu'>
      <button
        className='game-menu-toggle'
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span>Options</span>
        <motion.span
          className='game-menu-chevron'
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: EXPAND_SECONDS }}
        >
          <FaAngleDown size={CHEVRON_SIZE} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className='game-menu-body'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: EXPAND_SECONDS }}
          >
            <div className='game-menu-panel'>
              <div className={`game-menu-actions${hiddenUnless('none')}`}>
                <button className='button-common' onClick={goToSettings}>
                  Go to Settings
                </button>
                <button
                  className='button-common'
                  onClick={() => setExitPrompt('mode')}
                >
                  Change mode
                </button>
                <button
                  className='button-common'
                  onClick={() => setExitPrompt('home')}
                >
                  Return to main page
                </button>
              </div>

              <div className={`change-mode${hiddenUnless('mode')}`}>
                <p>Give up this run and pick another mode?</p>
                <div className='change-mode-answers'>
                  <button className='button-common' onClick={onChangeMode}>
                    Yes
                  </button>
                  <button
                    className='button-common'
                    onClick={() => setExitPrompt('none')}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className={`change-mode${hiddenUnless('home')}`}>
                <p>Go back to the main page?</p>
                <div className='change-mode-answers'>
                  <button
                    className='button-common'
                    onClick={() => onReturnHome(true)}
                  >
                    Drop the run
                  </button>
                  <button
                    className='button-common'
                    onClick={() => onReturnHome(false)}
                  >
                    Keep the run
                  </button>
                </div>
                <button
                  className='button-common'
                  onClick={() => setExitPrompt('none')}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GameMenu
