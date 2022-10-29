// ** Icon imports
import HomeOutline from 'mdi-material-ui/HomeOutline'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import ShieldOutline from 'mdi-material-ui/ShieldOutline'

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { CarSettings } from 'mdi-material-ui'

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
      icon: CarSettings,
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
        // },
        {
          title: 'Single Value Type',
          path: '/Config/singleValueTypeConfig'
        }
      ]
    }
  ]
}

export default navigation
