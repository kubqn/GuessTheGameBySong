import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import AnimatedRoutes from './components/AnimatedRoutes'
import Background from './components/Background'
import { Provider } from 'react-redux'
import store from './store/store'
function App() {
  return (
    <Router>
      <Background />
      <Provider store={store}>
        <AnimatedRoutes />
      </Provider>
    </Router>
  )
}

export default App
