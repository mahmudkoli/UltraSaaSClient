import { Box } from "@mui/material";
import { useState } from "react";
import SingleValueTypeConfigForm from "src/AdminForms/SingleValueTypeConfigForm";
import Banner from "src/common/Components/banner";
import CommonDialog from "src/common/Components/dialog";
import { SingleValueTypeConfig } from "src/common/Entity/SingleValueTypeConfig";
import { useAppDispatch, useAppSelector } from "src/hooks/reduxHooks";
import { openModal, closeModal } from "src/slices/modalSlice";

//dummy Data
const data: SingleValueTypeConfig[] = [
  { id: "1", name: "Test 1", code: "code 1", description: "Dest 1" },
  { id: "2", name: "Test 2", code: "code 2", description: "Dest 2" },
];

const SingleValueTypeConfig = () => {
  const dispatch = useAppDispatch();

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
        <Box>
          <ul>
            {data.map((item: SingleValueTypeConfig) => (
              <li key={item.id}>
                <p>
                  {item.name} | {item.code} | {item.description}
                </p>
                <button>Delete</button>
                <button onClick={() => handleFormDialog(item)}>Edit</button>
              </li>
            ))}
          </ul>
        </Box>
      </Box>
    </>
  );
};

export default SingleValueTypeConfig;
