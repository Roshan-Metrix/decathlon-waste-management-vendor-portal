import React from 'react'

const TotalBox = ({name, value}) => {
  return (
    <div className="bg-primaryColor p-3 rounded-lg shadow-md text-white flex flex-col items-center h-30 justify-center w-full">
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  )
}

export default TotalBox