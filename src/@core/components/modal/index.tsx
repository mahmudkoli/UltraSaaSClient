// ** React Imports
import { useState } from "react";

// ** MUI Imports
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

// ** Icon Imports
import Icon from "src/@core/components/icon";
import { useAppDispatch, useAppSelector } from "src/hooks/reduxHook";
import { closeModal, modalFlagState } from "src/store/apps/modal";

interface Props {
  title: string;
  form: JSX.Element;
}

const FormDialog = ({title, form} : Props) => {
  const dispatch = useAppDispatch();
  const modalFlag = useAppSelector(modalFlagState);
  const [open, setOpen] = useState<boolean>(modalFlag);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    dispatch(closeModal())
  }

  return (
    <>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle id="customized-dialog-title" sx={{ p: 4, minWidth: "500px" }}>
          <Typography variant="h6" component="span">
           {title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ top: 10, right: 10, position: "absolute", color: "grey.500" }}
          >
            <Icon icon="mdi:close" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
         {form}
        </DialogContent>
        <DialogActions sx={{ p: (theme) => theme.spacing(3) }}>
          <Button onClick={handleClose}>Save changes</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FormDialog;
