import { GridColumns, GridRenderCellParams } from "@mui/x-data-grid"
import { PaginatedApiResponse } from "src/types/apps/apiResponse"
import { SingleValueType } from "src/types/apps/singleValueTypes"
import * as Yup from "yup";

export default {
    listEndPoint: 'v1/institute',
    createEndPoint: 'v1/institute',
    editEndPoint: 'v1/institute',
    deleteEndPoint: 'v1/institute',
    pageTitle: 'Institute',
    createPageTitle: 'Create Institute',
    editPageTitle: 'Edit Institute',
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
        field: 'address',
        headerName: 'Address',
    },
];

//form Validation
export const SingleValueTypeConfigFormValidation = Yup.object({
    name: Yup.string()
        .min(6, "minimum length for name should be more than 6 characters")
        .required("Name is required"),
    code: Yup.string()
        .min(2, "Minimum length for code should be at least 2 characters")
        .required("code is required")
});