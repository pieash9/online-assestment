"use client";

import { LogOut, Menu, ChevronDown, UserCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLogoutMutation } from "@/hooks/api/useAuth";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { clearAuthUser } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const userRefId = user?.id ? user.id.slice(-8).toUpperCase() : null;

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
    <header className="border-b border-[#e5e7eb] bg-white">
      <div className="mx-auto flex min-h-16 w-full max-w-360 items-center justify-between gap-4 px-5 sm:px-8 lg:px-20">
        <Link className="flex items-center gap-3" href="/">
          <Image
            alt="Akij Resource"
            className="w-auto object-contain"
            height={32}
            src="/images/brand/logo.png"
            width={116}
          />
        </Link>

        <div className="hidden flex-1 md:flex md:items-center md:justify-start md:px-6">
          <Link className="text-[15px] font-medium text-[#334155] hover:text-[#1e293b]" href="/dashboard">
            Dashboard
          </Link>
        </div>

        <div className="hidden md:flex md:items-center">
          {user ? (
            <DropdownMenu open={openUserMenu} onOpenChange={setOpenUserMenu}>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#f8fafc]"
                  onMouseEnter={() => setOpenUserMenu(true)}
                  type="button"
                >
                  <UserCircle2 className="size-8 text-[#a0aec0]" />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-[#334155]">{user.name}</span>
                    <span className="text-xs text-[#64748b]">Ref. ID - {userRefId}</span>
                  </div>
                  <ChevronDown className="size-4 text-[#64748b]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52"
                onMouseEnter={() => setOpenUserMenu(true)}
                onMouseLeave={() => setOpenUserMenu(false)}
              >
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-[#334155]">{user.name}</p>
                  <p className="truncate text-xs text-[#64748b]">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  disabled={logoutMutation.isPending}
                  onClick={handleLogout}
                >
                  <LogOut data-icon="inline-start" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <SheetContent className="w-70" side="right">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4 pb-6">
                {user ? (
                  <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2">
                    <p className="text-sm font-semibold text-[#334155]">{user.name}</p>
                    <p className="truncate text-xs text-[#64748b]">{user.email}</p>
                    <p className="text-xs text-[#64748b]">Ref. ID - {userRefId}</p>
                  </div>
                ) : null}
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
