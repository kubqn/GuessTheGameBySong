import type { IconType } from 'react-icons'
import { FaForward } from 'react-icons/fa'
import { FaHeartCirclePlus, FaMusic, FaShieldHeart } from 'react-icons/fa6'
import { Ability } from '../../api'

export const ABILITY_ICONS: Record<Ability, IconType> = {
  [Ability.ExtraLife]: FaHeartCirclePlus,
  [Ability.SkipRound]: FaForward,
  [Ability.Unlock]: FaMusic,
  [Ability.Shield]: FaShieldHeart,
}
