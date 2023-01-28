// ** Icon imports
import HomeOutline from 'mdi-material-ui/HomeOutline'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import ShieldOutline from 'mdi-material-ui/ShieldOutline'

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

//** material icon
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';


const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Home',
      icon: HomeOutline,
      path: '/home'
    },
    {
      title: 'Second Page',
      icon: EmailOutline,
      path: '/second-page'
    },
    {
      title: 'Access Control',
      icon: ShieldOutline,
      path: '/acl',
      action: 'read',
      subject: 'acl-page'
    },
    {
      title: 'Configs',
      icon: PermDataSettingIcon,
      children: [
        {
          title: 'Mail',
          path: '/Config/mailConfig'
        },

        {
          title: 'SMS',
          path: '/Config/smsConfig'
        },
        // {
        //   title: 'Cards',
        //   children: [
        //     {
        //       title: 'Basic',
        //       path: '/components/cards/basic'
        //     },
        //     {
        //       title: 'Advanced',
        //       path: '/components/cards/advanced'
        //     }
        //   ]
        // }
      ]
    },
    {
      title: 'Setup',
      icon: SettingsSuggestIcon,
      children: [
        {
          title: 'Single Value Type',
          path: '/setup/singleValueTypeConfig'
        },
        {
          title: 'Test 1',
          path: '/Config/mailConfig'
        },        
      ]
    }
  ]
}

export default navigation
