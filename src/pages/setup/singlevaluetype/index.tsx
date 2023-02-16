import { useEffect } from 'react'
import DialogCustomized from 'src/@core/components/modal'
import { useAppDispatch, useAppSelector } from 'src/hooks/reduxHook'
import { fetchSingleValueTypeConfigList, singleValueTypePaginatedList } from 'src/store/apps/singleValueType'
import { QueryObject } from 'src/types/apps/common.types'
import { SingleValueType } from 'src/types/apps/singleValueTypes'

const SingleValueTypeHome = () => {
  const query = new QueryObject()
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(fetchSingleValueTypeConfigList(query))
  }, [])
  const list = useAppSelector(singleValueTypePaginatedList)

  return (
    <div>
      <h1>Hello from the otherside</h1>
      {list.data.map((item: SingleValueType) => (
        <p key={item.id}>{item.code}</p>
      ))}
      <DialogCustomized />
    </div>
  )
}

export default SingleValueTypeHome
