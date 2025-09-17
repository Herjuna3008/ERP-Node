import { useFormContext } from 'react-hook-form';

export default function RHFInput({ name, label, type = 'text', ...rest }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const config = type === 'number' ? { valueAsNumber: true } : {};

  return (
    <div className="form-control">
      {label && <label htmlFor={name}>{label}</label>}
      <input id={name} type={type} {...register(name, config)} {...rest} />
      {errors[name] && <p className="error">{errors[name]?.message}</p>}
    </div>
  );
}
