import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V10a6 6 0 1 0-12 0v4.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.2-4.2m1.2-4.8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h7v7H4zm9 0h7v11h-7zM4 13h7v7H4zm9 3h7v4h-7z" />
    </svg>
  );
}

export function UserCheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 10v-1a5 5 0 0 0-5-5H10a5 5 0 0 0-5 5v1m12-7 2 2 4-4" />
    </svg>
  );
}

export function UserPlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 10v-1a5 5 0 0 0-5-5H10a5 5 0 0 0-5 5v1m14-10v6m3-3h-6" />
    </svg>
  );
}

export function PawIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10c0 1.7-1.1 3-2.4 3S4.2 11.7 4.2 10s1.1-3 2.4-3S9 8.3 9 10Zm10.8 0c0 1.7-1.1 3-2.4 3S15 11.7 15 10s1.1-3 2.4-3S19.8 8.3 19.8 10ZM14 6c0 1.3-.9 2.3-2 2.3S10 7.3 10 6s.9-2.3 2-2.3S14 4.7 14 6ZM7 17c0-2.4 2.2-4.3 5-4.3s5 1.9 5 4.3c0 1.7-1.4 3-3 3H10c-1.6 0-3-1.3-3-3Z" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function StoreIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9 5 4h14l2 5M4 9h16v11H4zm4 0v3h8V9" />
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7m2 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm10 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
      />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 20 4.5-1 9.3-9.3a1.7 1.7 0 0 0 0-2.4l-1.1-1.1a1.7 1.7 0 0 0-2.4 0L5 15.5 4 20Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13.5 6.5 4 4" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V4h6v3m-8 0 1 12h8l1-12" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 15 1.5 2.6 3-.4.6-3 2.6-1.5-1.7-2.5 1.7-2.5-2.6-1.5-.6-3-3 .4L12 1 10.5 3.6l-3-.4-.6 3L4.3 7.7 6 10.2l-1.7 2.5 2.6 1.5.6 3 3-.4L12 19Zm0-6.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
    </svg>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 16v-2a2 2 0 0 0-2-2H4m0 0 3-3m-3 3 3 3m7-10h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
}
