const Input = ({label,name,type, desciptionId }) => {
  return (
    <div>
            <label className="fieldset-label" htmlFor={name}>{label}</label>
            <input type={type} name={name} id={name} className="input" placeholder={label} aria-describedby={desciptionId} />
    </div>
  )
}

export default Input
