import { Box, Button } from "@mui/material";
import { useState } from "react";
import SingleValueTypeConfigForm from "src/AdminForms/SingleValueTypeConfigForm";
import Banner from "src/common/Components/banner";
import CommonDialog from "src/common/Components/dialog";
import { SingleValueTypeConfig } from "src/common/Entity/SingleValueTypeConfig";
import { useAppDispatch, useAppSelector } from "src/hooks/reduxHooks";
import { openModal, closeModal } from "src/slices/modalSlice";
import { deleteSingleValueTypeConfig, singleValueTypeConfigList } from "src/slices/singleValueTypeConfigSlice";

//icon
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';


const SingleValueTypeConfig = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(singleValueTypeConfigList);

  const [formData, setFormData] = useState(null);
  const [dialogFlag, setDialogFlag] = useState(false);

  const handleFormDialog = (data: any) => {
    setDialogFlag((prevState) => !prevState);
    setFormData(data);
    dispatch(openModal());
  };

  const handleDialogClose = () => {
    dispatch(closeModal());
    setDialogFlag(false);
  }

  const handleDelete = (id:any) => {
    dispatch(deleteSingleValueTypeConfig(id));
  }
  const singleValueTypeConfigForm = (
    <SingleValueTypeConfigForm singleValueTypeData={formData} />
  );
  return (
    <>
      {dialogFlag && (
        <CommonDialog
          title="Single Value Type Config"
          form={singleValueTypeConfigForm}
          handleDialogClose={handleDialogClose}
        />
      )}
      <Box>
        <Banner title="Test Config" />
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleFormDialog}>Add</Button>
        <Box>
          <ul>
            {data.map((item: SingleValueTypeConfig) => (
              <li key={item.id}>
                <p>
                  {item.name} | {item.code} | {item.description}
                </p>
                <Button variant="outlined" color="error" endIcon={<DeleteIcon />} onClick={() => handleDelete(item.id)}>Delete</Button>
                <Button variant="outlined" endIcon={<EditIcon />} onClick={() => handleFormDialog(item)}>Edit</Button>
              </li>
            ))}
          </ul>
        </Box>
      </Box>
    </>
  );
};

export default SingleValueTypeConfig;
