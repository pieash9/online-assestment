 "use client";

import { LogOut, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/hooks/api/useAuth";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { clearAuthUser } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      dispatch(clearAuthUser());
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex min-h-20 w-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-20">
        <Link className="flex items-center gap-3" href="/">
          <Image
            alt="Akij Resource"
            className="h-8 w-auto object-contain"
            height={32}
            src="/images/brand/logo.png"
            width={116}
          />
        </Link>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-base font-semibold text-foreground sm:text-lg">
            Akij Resource
          </span>
          {user ? (
            <span className="text-xs text-muted-foreground sm:text-sm">
              {user.name} · {user.email}
            </span>
          ) : null}
        </div>

        <div className="hidden md:flex">
          {user ? (
            <Button
              disabled={logoutMutation.isPending}
              size="sm"
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut data-icon="inline-start" />
              Logout
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>


        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button aria-label="Open navigation menu" size="icon-sm" variant="outline">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[280px]" side="right">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4 pb-6">
                <Button asChild variant="ghost">
                  <Link href={user ? "/dashboard" : "/login"}>
                    {user ? "Dashboard" : "Login"}
                  </Link>
                </Button>
                {user ? (
                  <Button
                    disabled={logoutMutation.isPending}
                    variant="outline"
                    onClick={handleLogout}
                  >
                    <LogOut data-icon="inline-start" />
                    Logout
                  </Button>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
