"use client";

import StoreProvider from "@/lib/StoreProvider";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return <StoreProvider>{children}</StoreProvider>;
}
