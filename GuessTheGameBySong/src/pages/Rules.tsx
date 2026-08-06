import PageNav from '../components/PageNav'

const Rules = () => (
  <div className='intro-box'>
    <div className='rule-box'>
      <PageNav />
      <h2 className='rules-header'>Rules:</h2>
      <ul className='rules-list'>
        <li>You get 1 point each time you correctly guess the game.</li>
        <li>You have 5 lives, each wrong guess take 1 live.</li>
        <li className='powerup-rule'>
          After correctly guessing song in 1 attempt you get{' '}
          <span>"Power up point"</span> to use, you can:
          <p>Restore 1 health.</p>
          <p>Skip the current guess (you do not earn a point by doing that)</p>
          <p>Unlock all songs in the round</p>
          <p>
            Protect yourself from 3 wrong guesses (you do not unlock next songs)
          </p>
          <p>
            You can store them to get additional points (1 point per "Power up")
          </p>
        </li>
      </ul>
    </div>
  </div>
)

export default Rules
