import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6 px-5 py-6 sm:px-8 lg:px-20">
        <div className="flex flex-col gap-4 md:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300 sm:text-base">Powered by</span>
            <Image
              alt="Powered by Akij Resource"
              className="w-auto object-contain"
              height={32}
              src="/images/brand/logo-white.png"
              width={116}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-3 text-sm text-slate-200 sm:text-base lg:items-center">
            <span className="font-medium text-white">Helpline</span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Button asChild className="justify-start px-0 text-slate-200 hover:text-white" variant="link">
                <Link href="tel:+88011020202505">
                  <Phone data-icon="inline-start" />
                  +88 011020202505
                </Link>
              </Button>
              <Button asChild className="justify-start px-0 text-slate-200 hover:text-white" variant="link">
                <Link href="mailto:support@akij.work">
                  <Mail data-icon="inline-start" />
                  support@akij.work
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
