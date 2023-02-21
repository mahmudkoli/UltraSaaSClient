import { GridColumns, GridRenderCellParams } from "@mui/x-data-grid"
import { PaginatedApiResponse } from "src/types/apps/apiResponse"
import { SingleValueType } from "src/types/apps/singleValueTypes"
import * as Yup from "yup";

export default {
  listEndPoint: 'v1/singlevaluetypesetup',
  createEndPoint: 'v1/singlevaluetypesetup',
  editEndPoint: 'v1/singlevaluetypesetup',
  deleteEndPoint: 'v1/singlevaluetypesetup',
  pageTitle: 'Single Value Type',
  createPageTitle :'Create Single Value Type',
  editPageTitle :'Edit Single Value Type',
}

export const colum: GridColumns = [
  {
    flex: 0.25,
    minWidth: 290,
    field: 'name',
    headerName: 'Name',
  },
  {
    flex: 0.25,
    minWidth: 290,
    field: 'code',
    headerName: 'Code',
  },
  {
    flex: 0.25,
    minWidth: 290,
    field: 'description',
    headerName: 'Description',
  },
];

//form Validation
export const SingleValueTypeConfigFormValidation = Yup.object({
  name: Yup.string()
    .min(5, "minimum length for name should be more than 4 characters")
    .required("Name is required"),
  code: Yup.string()
    .min(2, "Minimum length for code should be at least 2 characters")
    .required("code is required"),
  description: Yup.string()
    .min(5, "Minimum length for description should be more than 4 characters")
    .required("description is required"),
});