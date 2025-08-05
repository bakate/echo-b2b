import { AuthLayout } from "@/modules/auth/ui/layouts/auth-layout";

type Props = {
  children: React.ReactNode;
};
export default function Layout({ children }: Props) {
  return <AuthLayout>{children}</AuthLayout>;
}
