import { OrganizationList } from "@clerk/nextjs";

type Props = {};
export const OrgSelectionScreen = ({}: Props) => {
  return (
    <OrganizationList
      hidePersonal
      afterSelectOrganizationUrl={"/"}
      afterCreateOrganizationUrl={"/"}
      skipInvitationScreen
    />
  );
};
