import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function RHFForm({ schema, defaultValues = {}, onSubmit, children }) {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
    </FormProvider>
  );
}
