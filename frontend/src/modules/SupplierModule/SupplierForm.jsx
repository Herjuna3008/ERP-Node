import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input, Button } from 'antd';

const { TextArea } = Input;

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
});

const SupplierForm = ({ onSubmit, defaultValues = { name: '', email: '', phone: '', address: '' } }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submit = (data) => {
    if (onSubmit) onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div>
        <Input placeholder="Name" {...register('name')} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      <div>
        <Input placeholder="Email" {...register('email')} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <Input placeholder="Phone" {...register('phone')} />
        {errors.phone && <p>{errors.phone.message}</p>}
      </div>
      <div>
        <TextArea rows={3} placeholder="Address" {...register('address')} />
        {errors.address && <p>{errors.address.message}</p>}
      </div>
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </form>
  );
};

export default SupplierForm;
