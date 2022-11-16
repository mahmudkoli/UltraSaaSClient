import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useAppSelector } from "src/hooks/reduxHooks";
import { modalFlagState } from "src/slices/modalSlice";
import { IconButton, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  title: string;
  form: JSX.Element;
  handleDialogClose: Function;
}

export default function CommonDialog({
  title,
  form,
  handleDialogClose,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const modalFlag = useAppSelector(modalFlagState);
  const [open, setOpen] = React.useState(modalFlag);

  const handleClose = () => {
    handleDialogClose();
  };

  return (
    <Dialog fullScreen={fullScreen} open={open} onClose={handleClose}>
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>{form}</DialogContent>
    </Dialog>
  );
}
