import { Box, Grid } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/hooks/reduxHook";
import {
  fetchSingleValueTypeConfigList,
  singleValueTypePaginatedList,
} from "src/store/apps/singleValueType";
import { QueryObject } from "src/types/apps/common.types";
import { colum } from "src/configs/singleValue";
import CustomDataTable from "src/@core/components/CustomTable";
import { PaginatedApiResponse } from "src/types/apps/apiResponse";
import SingleValueTitleCard from "src/views/apps/singleValueType/singleValueTitle";
import DeleteWarningDialog from "src/@core/components/ConfirmDialog";
import SingleValueTypeConfigForm from "src/views/apps/singleValueType/singleValueForm";
import { modalFlagState, openModal } from "src/store/apps/modal";
import { SingleValueType } from "src/types/apps/singleValueTypes";
import FormDialog from "src/@core/components/modal";

const SingleValueTypeHome = () => {
  const query = new QueryObject();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<SingleValueType | null>(null);
  const [dialogFlag, setDialogFlag] = useState(false);
  const flagState = useAppSelector(modalFlagState)

  const singleValueTypeConfigForm = (
    <SingleValueTypeConfigForm singleValueTypeData={formData} />
  );

  useEffect(() => {
    dispatch(fetchSingleValueTypeConfigList(query));
    return () => { };
  }, [query.pageSize, query.pageNumber]);

  useEffect(() => {
    setDialogFlag(flagState);
  }, [flagState])

  const data = useAppSelector(singleValueTypePaginatedList);

  const fetchList = useCallback(
    async (pageNo: number, pageSize: number) => {
      console.log(
        `fetch list function, page no ${pageNo} page size ${pageSize}`
      );
      query.pageSize = pageSize;
      query.pageNumber = pageNo;
      dispatch(fetchSingleValueTypeConfigList(query));
    },
    [query.pageNumber, query.pageSize]
  );

  const deleteHandler = (id: any) => {
    console.log(id);
  };

  const editHandler = (data: SingleValueType) => {
    console.log(data)
    setDialogFlag((prevState) => !prevState);
    setFormData(data);
    dispatch(openModal());
  };

  return (
    <>
      {dialogFlag && (
        <FormDialog
          title="Single Value Type Config"
          form={singleValueTypeConfigForm}
        />
      )}
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SingleValueTitleCard
            title="Single Value Type"
            showButtonBox={true}
          />
        </Grid>
        <Grid item xs={12}>
          {data?.data?.length && (
            <CustomDataTable
              column={colum}
              data={data}
              dataFetcher={fetchList}
              deleteOperationHandler={deleteHandler}
              editOperationHandler={editHandler}
            />
          )}
        </Grid>
      </Grid>
    </Box>
    </>
  );
};

export default SingleValueTypeHome;
