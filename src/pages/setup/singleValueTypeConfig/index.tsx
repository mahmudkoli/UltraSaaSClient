import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import SingleValueTypeConfigForm from "src/AdminForms/SingleValueTypeConfigForm";
import Banner from "src/common/Components/banner";
import CommonDialog from "src/common/Components/dialog";
import { singleValueTypeColumns } from "src/common/Entity/SingleValueTypeConfig";
import { useAppDispatch, useAppSelector } from "src/hooks/reduxHooks";
import { openModal, closeModal } from "src/slices/modalSlice";
import {
  deleteSingleValueTypeConfig,
  singleValueTypeConfigList,
  fetchSingleValueTypeConfigList,
} from "src/slices/singleValueTypeConfigSlice";

//icon
import AddIcon from "@mui/icons-material/Add";
import { QueryObject } from "src/common/Entity/QueryObject";
import DataTable from "src/common/Components/table/dataTable";

const Index = () => {
  const dispatch = useAppDispatch();
  const queryObject = new QueryObject();

  useEffect(() => {
    dispatch(fetchSingleValueTypeConfigList(queryObject));
    return () => {};
  }, []);

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
  };

  const handleDelete = (id: any) => {
    dispatch(deleteSingleValueTypeConfig(id));
  };

  const handleRowChange = () => {};
  const handlePageChange = () => {};
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
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleFormDialog}
        >
          Add
        </Button>
        <Box>
          {data.length > 0 && (
            <DataTable
              columnSettings={singleValueTypeColumns}
              rows={data}
              handleNumberOfRowChange={handleRowChange}
              handleNextPage={handlePageChange}
              isDeleteAble={true}
              isEditAble={true}
              handleDelete={handleDelete}
              handleEdit={handleFormDialog}
            />
          )}
        </Box>
      </Box>
    </>
  );
};

export default Index;
