type FormErrorProps = {
  message?: string;
};

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <span className="text-sm font-medium text-destructive">{message}</span>
  );
};
