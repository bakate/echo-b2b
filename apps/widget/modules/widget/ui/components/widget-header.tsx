import { cn } from "@workspace/ui/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const WidgetHeader = ({ children, className }: Props) => {
  return (
    <header className={cn("active-sidebar-item", className)}>{children}</header>
  );
};
