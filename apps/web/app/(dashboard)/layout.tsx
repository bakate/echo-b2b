import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";

type Props = {
  children: React.ReactNode;
};
export default function DashboardLayout({ children }: Props) {
  return <AuthGuard>{children}</AuthGuard>;
}
