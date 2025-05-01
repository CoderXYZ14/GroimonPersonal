import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t py-12 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-xl mb-4">
              <Image
                src="/logo2.svg"
                alt="logo"
                width={80}
                height={80}
                className="h-[30px] w-auto"
              />
              <span
                className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]"
                style={{
                  fontFamily: "'Outfit', 'Urbanist', 'Poppins', sans-serif",
                  letterSpacing: "-0.5px",
                }}
              >
                Groimon
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Automate your Instagram engagement and save hours of manual work.
            </p>
          </div>

          {/* Product Links Section */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4 text-lg">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/features"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/automation?type=post"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links Section */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4 text-lg">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="flex justify-center mt-12 space-x-6">
          <a
            href="https://www.instagram.com/longtermcollaboration/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <div className="w-6 h-6">
              <Image
                src="/instagram.svg"
                alt="Instagram"
                width={24}
                height={24}
                className="w-full h-full"
              />
            </div>
          </a>
          <a
            href="https://www.linkedin.com/company/long-term-collab/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="LinkedIn"
          >
            <div className="w-6 h-6">
              <Image
                src="/linkedin.svg"
                alt="LinkedIn"
                width={24}
                height={24}
                className="w-full h-full"
              />
            </div>
          </a>
        </div>

        {/* Footer Bottom Section */}
        <div className="border-t mt-6 pt-8 text-center text-muted-foreground">
          <p className="text-sm">
            © {new Date().getFullYear()}{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
              Groimon
            </span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
