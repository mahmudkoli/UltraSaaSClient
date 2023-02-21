import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import DialogCustomized from "src/@core/components/modal";
import { useAppDispatch, useAppSelector } from "src/hooks/reduxHook";
import {
  fetchSingleValueTypeConfigList,
  singleValueTypePaginatedList,
} from "src/store/apps/singleValueType";
import { QueryObject } from "src/types/apps/common.types";
import { SingleValueType } from "src/types/apps/singleValueTypes";
import singleValueConfig, {colum} from "src/configs/singleValue";
import CustomDataTable from "src/@core/components/CustomTable";
import { PaginatedApiResponse } from "src/types/apps/apiResponse";

const SingleValueTypeHome = () => {
  const query = new QueryObject();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchSingleValueTypeConfigList(query));
  }, [ query.pageSize, query.pageNumber ]);

  const data =useAppSelector(singleValueTypePaginatedList);

  const fetchList = useCallback(
    async (pageNo: number, pageSize: number) => {
      console.log(`fetch list function, page no ${pageNo} page size ${pageSize}`);
      query.pageSize = pageSize;
      query.pageNumber = pageNo;
      dispatch(fetchSingleValueTypeConfigList(query));     
    },
    [query.pageNumber, query.pageSize]
  );

  const deleteHandler = (id:any) => {
    console.log(id);
  }

  const editHandler = (data:any) => {
    console.log(data);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <HeaderCard />
        </Grid>
        <Grid item xs={12}>
          {data?.data?.length && <CustomDataTable
            column={colum}
            data={data}
            dataFetcher={fetchList}
            deleteOperationHandler={deleteHandler}
            editOperationHandler={editHandler}
          />}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SingleValueTypeHome;

const HeaderCard = () => {
  return (
    <>
      <Card>
        <Box
          sx={{
            minWidth: 275,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Grid item xs={8}>
            <CardContent>
              <Typography
                sx={{ fontSize: 24 }}
                color="text.primary"
                gutterBottom
              >
                {singleValueConfig.pageTitle}
              </Typography>
            </CardContent>
          </Grid>
          <Grid item xs={4}>
            <CardActions
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Button sx={{ marginRight: "5px" }} variant="outlined">
                <Link href={"singlevaluetype/create"}>Create</Link>
              </Button>
              <DialogCustomized />
            </CardActions>
          </Grid>
        </Box>
      </Card>
    </>
  );
};
