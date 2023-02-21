// ** React Imports
import { useEffect, useState, useCallback, ChangeEvent } from "react";
// ** MUI Imports
import Card from "@mui/material/Card";
import {
  DataGrid,
  GridColumns,
  GridRenderCellParams,
  GridSortModel,
} from "@mui/x-data-grid";
import { Button } from "@mui/material";

//** types import */
import { PaginatedApiResponse } from "src/types/apps/apiResponse";
import DeleteWarningDialog from "../ConfirmDialog";


//props with table settings
interface Props {
  column: GridColumns;
  data?: PaginatedApiResponse<any> | null;
  dataFetcher: Function;
  editOperationHandler?: Function;
  deleteOperationHandler?:Function;
  isEditAble?: boolean;
  isDeleteAble?: boolean;
}

type SortType = "asc" | "desc" | undefined | null;

export default function CustomDataTable({ column, data, dataFetcher, deleteOperationHandler, editOperationHandler }: Props) {
  //action buttons
  const extraColums = [
    {
      flex: 0.125,
      minWidth: 140,
      field: "id",
      headerName: "Actions",
      renderCell: (params: GridRenderCellParams) => {
        return (
          <>
            <Button
              size="small"
              sx={{ marginRight: "5px" }}
              variant="outlined"
              color="warning"
              onClick={() => handleEdit(params)}
            >
              Edit
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleDelete(params)}
            >
              Delete
            </Button>
          </>
        );
      },
    },
  ];
  column = [...column, ...extraColums];
  // ** State
  const [page, setPage] = useState(data?.currentPage || 1);
  const [total, setTotal] = useState<number>(data?.totalCount || 0);
  const [sort, setSort] = useState<SortType>("asc");
  const [pageSize, setPageSize] = useState<number>(data?.pageSize || 10);
  const [rows, setRows] = useState<any[]>(data?.data || []);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string>("id");
  const [deleteFlag, setDeleteFlag] = useState<boolean>(false);
  const [operationData, setOperationData] = useState<any>(null);

  const handleEdit = (data: GridRenderCellParams) => {
    editOperationHandler!(data.row);
  };

  const handleDelete = (data: GridRenderCellParams) => {
    setOperationData(data);
    setDeleteFlag(true);
  };

  const handleConfirmDelete = (flag : boolean) => {
    deleteOperationHandler!(operationData.value);
    setDeleteFlag(flag);
    setOperationData(null);
  }

  const handleSearch = (value: any) => {
    console.log(value);
  };

  const fetchTableData = useCallback(
    async (sort: SortType, q: string, column: string) => {
      console.log(pageSize);
      console.log("hehllo from the fetchTable ", pageSize);
      dataFetcher(page, pageSize);
    },
    [page, pageSize]
  );

  useEffect(() => {
    fetchTableData(sort, searchValue, sortColumn);
  }, [fetchTableData, searchValue, sort, sortColumn]);
 
  console.log("rows :: ", rows);

  return (
    <Card>
      {/* <CardHeader title="Testing Table" /> */}
      {(deleteFlag && operationData) && <DeleteWarningDialog confirmHandler={handleConfirmDelete} flag={deleteFlag} />}
      <DataGrid
        autoHeight
        pagination
        rows={rows}
        rowCount={total}
        columns={column}
        pageSize={pageSize}
        sortingMode="server"
        paginationMode="server"
        rowsPerPageOptions={[7, 10, 25, 50]}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
      />
    </Card>
  );
}



