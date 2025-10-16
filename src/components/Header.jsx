// src/components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
      <Link href="/" className="flex items-center space-x-2">
        <img
          src="/Logo.png"
          alt="FinderRight Logo"
          className="h-10"
          width={40}
          height={40}
          priority // Next.js Image optimization flag (optional, if using next/image)
        />
        <span className="text-xl font-bold text-blue-600">FinderRight</span>
      </Link>
    </header>
  );
}
