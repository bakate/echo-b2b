type Props = {
  children: React.ReactNode;
};
export const AuthLayout = ({ children }: Props) => {
  return (
    <div className="flex items-center justify-center min-h-svh flex-col">
      {children}
    </div>
  );
};
