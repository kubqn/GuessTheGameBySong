import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import { MotionConfig } from 'framer-motion'
import AnimatedRoutes from './components/AnimatedRoutes'
import Background from './components/Background'
import { Provider } from 'react-redux'
import store from './store/store'
import { useAppSelector } from './store/hooks'
import { selectSettings } from './store/selectors'

const Shell = () => {
  const { reduceAnimations } = useAppSelector(selectSettings)
  return (
    <MotionConfig reducedMotion={reduceAnimations ? 'always' : 'user'}>
      <Background />
      <AnimatedRoutes />
    </MotionConfig>
  )
}

function App() {
  return (
    <Router>
      <Provider store={store}>
        <Shell />
      </Provider>
    </Router>
  )
}

export default App
