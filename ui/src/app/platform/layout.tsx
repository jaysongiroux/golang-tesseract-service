import { PolarProvider } from "@/providers/polarProvider";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PolarProvider>{children}</PolarProvider>;
}
