import type { SVGProps } from "react";

export function ExitFullScreenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16 6V12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16H6M42 16H36C34.9391 16 33.9217 15.5786 33.1716 14.8284C32.4214 14.0783 32 13.0609 32 12V6M32 42V36C32 34.9391 32.4214 33.9217 33.1716 33.1716C33.9217 32.4214 34.9391 32 36 32H42M6 32H12C13.0609 32 14.0783 32.4214 14.8284 33.1716C15.5786 33.9217 16 34.9391 16 36V42"
        stroke="white"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
