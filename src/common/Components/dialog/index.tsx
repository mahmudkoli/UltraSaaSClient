import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useAppDispatch, useAppSelector } from "src/hooks/reduxHooks";
import { closeModal, modalFlagState } from "src/slices/modalSlice";
import { IconButton, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  title: string;
  form: JSX.Element;
}

export default function CommonDialog({
  title,
  form,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md')); 
  const modalFlag = useAppSelector(modalFlagState);
  const [open, setOpen] = React.useState(modalFlag);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(closeModal())
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
