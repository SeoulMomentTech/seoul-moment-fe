"use client";

import { CircleUserRound } from "lucide-react";

import { cn } from "@shared/lib/style";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Skeleton,
} from "@seoul-moment/ui";

import { useGetUserInfoQuery } from "../api/useGetUserInfoQuery";
import { useGetUserProfileQuery } from "../api/useGetUserProfileQuery";

interface ProfileHeaderProps {
  className?: string;
}

export function ProfileHeader({ className }: ProfileHeaderProps) {
  const { data: profile, isLoading: isProfileLoading } =
    useGetUserProfileQuery();
  const { data: info, isLoading: isInfoLoading } = useGetUserInfoQuery();

  const isLoading = isProfileLoading || isInfoLoading;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-[12px] border border-black/10 px-6 py-5",
        "max-sm:flex-col max-sm:items-stretch max-sm:gap-4 max-sm:border-none max-sm:px-0 max-sm:pb-0",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarImage
            alt={profile?.nickname ?? ""}
            src={profile?.profileImageUrl}
          />
          <AvatarFallback>
            <CircleUserRound
              className="size-[60px] text-black/30"
              strokeWidth={0.75}
            />
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-44" />
            </>
          ) : (
            <>
              <span className="text-body-1 font-bold text-black">
                {profile?.nickname ?? "nickName"}
              </span>
              <span className="text-body-3 text-black/50">
                {info?.email ?? ""}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 max-sm:w-full">
        <Button
          className="max-sm:flex-1"
          size="sm"
          type="button"
          variant="outline"
        >
          프로필 관리
        </Button>
        <Button
          className="max-sm:flex-1"
          size="sm"
          type="button"
          variant="outline"
        >
          내 스타일
        </Button>
      </div>
    </div>
  );
}
