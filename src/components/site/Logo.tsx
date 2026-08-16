import Image from "next/image";

export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 ${className}`}>
      <Image src="/logo.png" alt="Pulse" fill sizes="40px" className="object-contain" />
    </span>
  );
}
