import { useFormContext } from 'react-hook-form';

export default function RHFSelect({ name, label, options = [], ...rest }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="form-control">
      {label && <label htmlFor={name}>{label}</label>}
      <select id={name} {...register(name, { valueAsNumber: true })} {...rest}>
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {errors[name] && <p className="error">{errors[name]?.message}</p>}
    </div>
  );
}
