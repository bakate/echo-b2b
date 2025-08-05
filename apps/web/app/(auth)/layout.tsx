type Props = {
  children: React.ReactNode;
};
const AuthLayout = ({ children }: Props) => {
  return (
    <div className="flex items-center justify-center min-h-svh flex-col min-w-svh">
      {children}
    </div>
  );
};

export default AuthLayout;
