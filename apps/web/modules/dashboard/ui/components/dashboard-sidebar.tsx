"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
  Mic,
  LayoutDashboardIcon,
  LibraryBigIcon,
  PaletteIcon,
  InboxIcon,
  CreditCardIcon,
} from "lucide-react";
// import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import { useState } from "react";
import {
  Sidebar,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarFooter,
} from "@workspace/ui/components/sidebar";
//import {cn} from "@workspace/ui/lib/utils";

const customerSupportItems = [
  {
    title: "Conversations",
    url: "/conversations",
    icon: InboxIcon,
  },
  {
    title: "Knowledge base",
    url: "/files",
    icon: LibraryBigIcon,
  },
];

const configurationItems = [
  {
    title: "Widget Customization",
    url: "/customization",
    icon: PaletteIcon,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Voice Assistant",
    url: "/plugins/vapi",
    icon: Mic,
  },
];

const accountItems = [
  {
    title: "Plans & billing",
    url: "/billing",
    icon: CreditCardIcon,
  },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(url);
  };
  return (
    <Sidebar className="group" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <OrganizationSwitcher
                hidePersonal
                skipInvitationScreen
                appearance={{
                  elements: {
                    rootBox: "w-full! h-8!",
                    avatarBox: "size-4! rounded-md!",
                    organizationSwitcherTrigger:
                      "w-full! justify-start! group-data[collapsible=icon]:size-8! group-data[collapsible=icon]:p-2!",
                    organizationPreview:
                      "group-data[collapsible=icon]:justify-center! gap-2!",
                    organizationPreviewTextContainer:
                      "group-data[collapsible=icon]:hidden! text-xs! font-medium! text-sidebar-foreground!",
                    organizationSwitcherTriggerIcon:
                      "group-data[collapsible=icon]:hidden! ml-auto! text-sidebar-foreground!",
                  },
                }}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Customer support */}
        <SidebarGroup>
          <SidebarGroupLabel>Customer support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {customerSupportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={
                      isActive(item.url)
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configuration */}
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configurationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={
                      isActive(item.url)
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={
                      isActive(item.url)
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <UserButton
                showName
                appearance={{
                  elements: {
                    rootBox: "w-full! h-8!",
                    userButtonTrigger:
                      "w-full! p-2! hover:bg-sidebar-accent! hover:text-sidebar-foreground! group-data[collapsible=icon]:size-8! group-data[collapsible=icon]:p-2!",
                    userButtonBox:
                      "w-full! flex-row-reverse! justify-end! gap-2! group-data[collapsible=icon]:justify-center! text-sidebar-foreground!",
                    userButtonOuterIdentifier:
                      "pl-0! group-data[collapsible=icon]:hidden! ",
                    avatarBox: "size-4!",
                  },
                }}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
