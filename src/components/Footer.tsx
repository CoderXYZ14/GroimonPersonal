import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t py-12 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 font-bold text-xl mb-4">
              <Image src="/logo.svg" alt="logo" width={80} height={25} />
              <span>Groimon</span>
            </div>
            <p className="text-muted-foreground">
              Automate your Instagram engagement and save hours of manual work.
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/features"
                  className="text-muted-foreground hover:text-purple-500 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-purple-500 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/automation?type=post"
                  className="text-muted-foreground hover:text-purple-500 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-purple-500 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-purple-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-muted-foreground hover:text-purple-500 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Groimon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
