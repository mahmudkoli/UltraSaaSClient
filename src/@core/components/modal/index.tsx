// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface Props {
  title: string
  form: JSX.Element
}

// export default function CommonDialog({ title, form }: Props) {
//   const theme = useTheme()
//   const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
//   const modalFlag = useAppSelector(modalFlagState)
//   const [open] = React.useState(modalFlag)
//   const dispatch = useAppDispatch()

//   const handleClose = () => {
//     dispatch(closeModal())
//   }

//   return (
//     <Dialog fullScreen={fullScreen} open={open} onClose={handleClose}>
//       <DialogTitle>
//         {title}
//         <IconButton
//           aria-label='close'
//           onClick={handleClose}
//           sx={{
//             position: 'absolute',
//             right: 8,
//             top: 8,
//             color: theme => theme.palette.grey[500]
//           }}
//         >
//           <Icon icon='mdi:close' />
//         </IconButton>
//       </DialogTitle>
//       <DialogContent>{form}</DialogContent>
//     </Dialog>
//   )
// }

const DialogCustomized = () => {
  // ** State
  const [open, setOpen] = useState<boolean>(false)

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => setOpen(false)

  return (
    <div>
      <Button variant='outlined' onClick={handleClickOpen}>
        Open dialog
      </Button>
      <Dialog onClose={handleClose} aria-labelledby='customized-dialog-title' open={open}>
        <DialogTitle id='customized-dialog-title' sx={{ p: 4 }}>
          <Typography variant='h6' component='span'>
            Modal title
          </Typography>
          <IconButton
            aria-label='close'
            onClick={handleClose}
            sx={{ top: 10, right: 10, position: 'absolute', color: 'grey.500' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
          <h1>Hello from the other side</h1>
        </DialogContent>
        <DialogActions sx={{ p: theme => theme.spacing(3) }}>
          <Button onClick={handleClose}>Save changes</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default DialogCustomized
