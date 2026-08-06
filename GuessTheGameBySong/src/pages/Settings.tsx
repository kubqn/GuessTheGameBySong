import PageNav from '../components/PageNav'
import SettingsOptions from '../components/SettingsOptions'

const Settings = () => (
  <div className='intro-box'>
    <div className='rule-box'>
      <PageNav />
      <h2 className='rules-header'>Settings:</h2>
      <SettingsOptions />
    </div>
  </div>
)

export default Settings
