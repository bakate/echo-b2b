"use client";

import { WidgetHeader } from "../components/widget-header";
import { WidgetFooter } from "../components/widget-footer";

type Props = {
  organizationId: string;
};
export const WidgetScreen = ({ organizationId }: Props) => {
  return (
    <main className="flex min-h-svh min-w-svw flex-col overflow-hidden rounded-xl border bg-muted">
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className=" text-3xl">Hi there! 👋🏽👋🏽</p>
          <p className="text-lg">How can we help you today?</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1">Widget Screen {organizationId}</div>
      <WidgetFooter />
    </main>
  );
};
