const Submit = ({ value, type }) => {
  return (
    <div>
        <button type={type} className="btn btn-neutral mt-4">{value}</button>
    </div>
  )
}

export default Submit
