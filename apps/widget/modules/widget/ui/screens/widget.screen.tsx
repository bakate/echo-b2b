"use client";

import { useAtomValue } from "jotai";
import { WidgetAuthScreen } from "./widget-auth.screen";
import { screenAtom } from "../../atoms/widget-atoms";
import { ReactNode } from "react";
import { WidgetErrorScreen } from "./widget-error.screen";
import { WidgetLoadingScreen } from "./widget-loading.screen";

type Props = {
  organizationId: string | null;
};

export const WidgetScreen = ({ organizationId }: Props) => {
  const screen = useAtomValue(screenAtom);
  const screenComponents: Record<typeof screen, ReactNode> = {
    auth: <WidgetAuthScreen />,
    selection: <div>TODO: Selection</div>,
    inbox: <div>TODO: Inbox</div>,
    chat: <div>TODO: Chat</div>,
    contact: <div>TODO: Contact</div>,
    error: <WidgetErrorScreen />,
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    voice: <div>TODO: Voice</div>,
  };
  return (
    <main className="flex min-h-svh min-w-svw flex-col overflow-hidden rounded-xl border bg-muted">
      {/* <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className=" text-3xl">Hi there! 👋🏽👋🏽</p>
          <p className="text-lg">How can we help you today?</p>
        </div>
      </WidgetHeader> */}
      {screenComponents[screen]}
      {/* <div className="flex flex-1">Widget Screen {organizationId}</div>
      <WidgetFooter /> */}
    </main>
  );
};
