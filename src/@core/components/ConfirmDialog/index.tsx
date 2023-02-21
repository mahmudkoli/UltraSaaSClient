// ** React Imports
import { Fragment, useState } from "react";

// ** MUI Imports
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";

interface Props {
  flag: boolean;
  confirmHandler: Function;
}

const DeleteWarningDialog = ({ flag, confirmHandler }: Props) => {
  // ** State
  const [open, setOpen] = useState<boolean>(flag);
  const handleClose = () => {
    setOpen(false);
    confirmHandler(false);
  };
  const handleConfirm = () => confirmHandler(true);

  return (
    <Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure, you want to delete this item
          </DialogContentText>
        </DialogContent>
        <DialogActions className="dialog-actions-dense">
          <Button onClick={handleConfirm} color="error">
            Yes
          </Button>
          <Button onClick={handleClose} color="success">
            NO
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default DeleteWarningDialog;
