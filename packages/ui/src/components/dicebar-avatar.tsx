"use client";

import { useMemo } from "react";
import { glass } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar.js";
import { cn } from "../lib/utils.js";

type Props = {
  seed: string;
  size?: number;
  className?: string;
  badgeClassName?: string;
  imageUrl?: string;
  badgeImageUrl?: string;
};
export const DicebarAvatar = ({
  seed,
  size = 32,
  className,
  badgeClassName,
  imageUrl,
  badgeImageUrl,
}: Props) => {
  const avatarSrc = useMemo(() => {
    if (imageUrl) return imageUrl;

    const avatar = createAvatar(glass, {
      seed: seed.toLowerCase().trim(),
      size,
    });
    return avatar.toDataUri();
  }, [seed, size]);

  const badgeSize = Math.round(size * 0.5);
  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      <Avatar
        className={cn("border", className)}
        style={{ width: size, height: size }}
      >
        <AvatarImage src={avatarSrc} alt="User avatar" />
        <AvatarFallback></AvatarFallback>
      </Avatar>
      {badgeImageUrl ? (
        <div
          className={cn(
            "absolute bottom-0 right-0 flex items-center justify-center overflow-hidden rounded-full border-2 border-background bg-background",
            badgeClassName
          )}
          style={{
            width: badgeSize,
            height: badgeSize,
            transform: "translate(15%, 15%)",
          }}
        >
          <img
            src={badgeImageUrl}
            alt="badge"
            height={badgeSize}
            width={badgeSize}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );
};
