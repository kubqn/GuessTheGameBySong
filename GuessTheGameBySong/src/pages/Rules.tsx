import { useEffect } from 'react'
import PageNav from '../components/PageNav'
import { loadAbilityCatalog } from '../store/actions'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectAbilityCatalog } from '../store/selectors'

const Rules = () => {
  const dispatch = useAppDispatch()
  const catalog = useAppSelector(selectAbilityCatalog)
  const abilities = Object.values(catalog)

  useEffect(() => {
    if (abilities.length === 0) {
      dispatch(loadAbilityCatalog())
    }
  }, [dispatch, abilities.length])

  return (
    <div className='intro-box'>
      <div className='rule-box'>
        <PageNav />
        <h2 className='rules-header'>Rules:</h2>
        <ul className='rules-list'>
          <li>You get 1 point each time you correctly guess the game.</li>
          <li>You have 5 lives, each wrong guess take 1 live.</li>
          <li className='powerup-rule'>
            Guessing on the first clip earns a <span>"Power up point"</span>.
            Power ups cost points and go on cooldown for a number of rounds
            after use:
            {abilities.map((ability) => (
              <p key={ability.pretty_name}>
                <span>
                  {ability.pretty_name} — {ability.cost}{' '}
                  {ability.cost === 1 ? 'point' : 'points'}
                  {ability.cooldown > 0 &&
                    `, ${ability.cooldown} round cooldown`}
                </span>
                <br />
                {ability.description}
              </p>
            ))}
            <p>Unspent points are worth 1 point each at the end of a run.</p>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Rules
