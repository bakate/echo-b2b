"use client";

import { WidgetScreen } from "@/modules/widget/ui/screens/widget.screen";
import { use } from "react";

type Props = {
  searchParams: Promise<{
    organizationId: string;
  }>;
};
export default function Page({ searchParams }: Props) {
  const { organizationId } = use(searchParams);
  return <WidgetScreen organizationId={organizationId} />;
}
