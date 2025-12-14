"use client";

import { type HTTPError, isKyError } from "ky";
import Image from "next/image";

import { Link } from "@/i18n/navigation";

import { Button } from "@seoul-moment/ui";

interface GlobalErrorProps {
  error: Error & { digest?: string };
}

const DEFAULT_ERROR = {
  title: "Something went wrong",
  description: [
    "Something went wrong :(",
    "An unexpected error has occurred.",
    "Please try again later.",
  ],
};

const SERVER_ERROR = {
  title: "500 Error",
  description: [
    "Internal Server Error :(",
    "Sorry, something went wrong on our side.",
    "Please try again later.",
  ],
};

function resolveErrorContent(error: Error) {
  if (isKyError(error)) {
    const status = (error as HTTPError).response?.status;

    if (status && status >= 500) {
      return {
        title: `${status} Error`,
        description: SERVER_ERROR.description,
      };
    }
  }

  return DEFAULT_ERROR;
}

export default function GlobalError({ error }: GlobalErrorProps) {
  const { title, description } = resolveErrorContent(error);

  return (
    <div className="flex flex-col items-center gap-[60px] pt-[156px] max-sm:px-[20px] max-sm:pt-[136px]">
      <div className="flex flex-col items-center gap-[30px] text-center">
        <div className="flex flex-col items-center gap-[12px]">
          <figure className="h-[60px] w-[60px] max-sm:h-[50px] max-sm:w-[50px]">
            <Image alt="" height={60} src="/404.png" width={60} />
          </figure>
          <h1 className="text-title-2 max-sm:text-title-3 font-extrabold">
            {title}
          </h1>
        </div>
        <div className="max-sm:text-body-3">
          {description.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>

      <Button
        asChild
        className="h-[48px] w-[186px] whitespace-pre font-semibold max-sm:w-full"
      >
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
