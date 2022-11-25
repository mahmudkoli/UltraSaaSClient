import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import SingleValueTypeConfigForm from "src/AdminForms/SingleValueTypeConfigForm";
import Banner from "src/common/Components/banner";
import CommonDialog from "src/common/Components/dialog";
import { singleValueTypeColumns } from "src/common/Entity/SingleValueTypeConfig";
import { useAppDispatch, useAppSelector } from "src/hooks/reduxHooks";
import { openModal, modalFlagState } from "src/slices/modalSlice";
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
  const [formData, setFormData] = useState(null);
  const [dialogFlag, setDialogFlag] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [rowNumbers, setRoWNumbers] = useState(10);
  const flagState = useAppSelector(modalFlagState)

  const queryObject = new QueryObject();

  useEffect(() => {
    queryObject.pageNumber = pageNo;
    queryObject.pageSize = rowNumbers;
    dispatch(fetchSingleValueTypeConfigList(queryObject));
    return () => { };
  }, [pageNo, rowNumbers]);

  useEffect(() => {
    setDialogFlag(flagState);
  }, [flagState])

  const data = useAppSelector(singleValueTypeConfigList);

  const handleFormDialog = (data: any) => {
    setDialogFlag((prevState) => !prevState);
    setFormData(data);
    dispatch(openModal());
  };

  const handleDelete = (id: any) => {
    dispatch(deleteSingleValueTypeConfig(id));
  };

  const handleRowChange = (rows: any = 10) => {
    setPageNo(1);
    setRoWNumbers(rows);
  };
  const handlePageChange = () => {
    setPageNo((prevstate) => prevstate++);
  };
  const singleValueTypeConfigForm = (
    <SingleValueTypeConfigForm singleValueTypeData={formData} />
  );
  return (
    <>
      {dialogFlag && (
        <CommonDialog
          title="Single Value Type Config"
          form={singleValueTypeConfigForm}
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
