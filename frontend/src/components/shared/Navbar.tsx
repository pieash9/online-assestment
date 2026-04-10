import { Menu, Home, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
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
          <div className="flex flex-col mx-auto">
            <span className="text-base font-semibold text-foreground sm:text-lg">
              Akij Resource
            </span>
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
