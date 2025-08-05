"use client";

import { useOrganization } from "@clerk/nextjs";
import { AuthLayout } from "../layouts/auth-layout";
import { OrgSelectionScreen } from "../screens/org-selection.screen";

type Props = {
  children: React.ReactNode;
};
export const OrganizationGuard = ({ children }: Props) => {
  const { organization } = useOrganization();
  if (!organization) {
    return (
      <AuthLayout>
        <OrgSelectionScreen />
      </AuthLayout>
    );
  }
  return <>{children}</>;
};
