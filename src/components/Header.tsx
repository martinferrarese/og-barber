"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/og-barber.jpeg";

export default function Header() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <header className="p-4 flex justify-center items-center">
      <Link
        href="/"
        aria-label="Volver al inicio"
        className="inline-block hover:opacity-80"
      >
        <Image src={logo} alt="Volver al inicio" width={24} height={24} />
      </Link>
    </header>
  );
}
