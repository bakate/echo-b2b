"use client";
import { Button } from "@workspace/ui/components/button";
import { Hint } from "@workspace/ui/components/hint";
import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";
import { ConversationStatus } from "../../types";

type Props = {
  status: ConversationStatus;
  onClick: () => void;
  disabled?: boolean;
};
export const ConversationStatusButton = ({
  status,
  onClick,
  disabled,
}: Props) => {
  if (status === "resolved") {
    return (
      <Hint text={"Mark as unresolved"}>
        <Button
          variant="tertiary"
          size="sm"
          onClick={onClick}
          disabled={disabled}
        >
          <CheckIcon />
          Resolved
        </Button>
      </Hint>
    );
  }
  if (status === "escalated") {
    return (
      <Hint text={"Mark as resolved"}>
        <Button
          variant="warning"
          size="sm"
          onClick={onClick}
          disabled={disabled}
        >
          <ArrowUpIcon />
          Escalated
        </Button>
      </Hint>
    );
  }
  return (
    <Hint text={"Mark as escalated"}>
      <Button
        variant="destructive"
        size="sm"
        onClick={onClick}
        disabled={disabled}
      >
        <ArrowRightIcon />
        Unresolved
      </Button>
    </Hint>
  );
};
