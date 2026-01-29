"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReliqueMark } from "../logo/ReliqueMark";

export function Footer() {
  const router = useRouter();

  const links = [
    { name: "Authenticate", href: "/authenticate" },
    { name: "Consign", href: "/consign" },
    { name: "Verify", href: "/verify" },
    { name: "Artificial Intelligence", href: "/about#ai-powered" },
    { name: "About Us", href: "/about#who-we-are" },
    { name: "Contact", href: "/contact" },
    { name: "Terms & Policies", href: "/terms-policies" },
  ];

  const handleNavClick = (href: string) => {
    const [path, hash] = href.split("#");
    router.push(path || "/");
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView();
      }, 100);
    }
  };

  return (
    <footer className="bg-[#050505] border-t border-white/10 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 md:gap-16 mb-12 sm:mb-16 md:mb-20">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2  sm:gap-3 mb-6 sm:mb-8 cursor-pointer group" onClick={() => router.push("/")}>
              <Link href="/" className="group transition-transform active:scale-95">
                <ReliqueMark
                  size="lg"
                  className="tracking-wide"
                />
              </Link>
            </div>
            <p className="text-textSec max-w-sm mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
              Relics you can rely on.
            </p>
            <div className="flex gap-3 sm:gap-4">
              {["Twitter", "Instagram", "LinkedIn"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 sm:w-10 sm:h-10 border border-white/10 flex items-center justify-center rounded-full hover:bg-primaryBlue hover:border-primaryBlue transition-all group"
                >
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-white/40 group-hover:text-white">{s[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black uppercase text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] mb-6 sm:mb-8 md:mb-10 text-primaryBlue">Navigation</h4>
            <ul className="flex flex-col gap-3 sm:gap-4 md:gap-5">
              {links.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-textSec hover:text-highlightIce transition-colors text-[10px] sm:text-xs font-black uppercase tracking-[0.08em] sm:tracking-[0.1em] flex items-center gap-1 sm:gap-2 group text-left"
                  >
                    <span className="w-0 h-[1px] bg-primaryBlue group-hover:w-3 sm:group-hover:w-4 transition-ease-in-out duration-300" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] mb-6 sm:mb-8 md:mb-10 text-primaryBlue">Newsletter</h4>
            <p className="text-textSec text-xs sm:text-sm mb-4 sm:mb-6 font-medium">Sign up for our newsletter to stay updated on our latest news and products.</p>
            <div className="flex flex-col sm:flex-row bg-cardDark border border-white/10 sm:p-1 group focus-within:border-highlightIce transition-all">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="bg-transparent px-4 py-3 text-[9px] sm:text-[10px] font-black w-full focus:outline-none"
              />
              <button className="bg-primaryBlue px-4 py-3 sm:px-6 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-accentBlue transition-colors whitespace-nowrap">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 sm:pt-8 md:pt-10 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <p className="text-[9px] sm:text-[10px] font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase text-textSec text-center md:text-left">
            © {new Date().getFullYear()} RELIQUE.CH. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-4 sm:gap-6">
            {["TW", "IG", "LI"].map((social) => (
              <a key={social} href="#" className="text-textSec hover:text-white font-black text-[10px] sm:text-xs">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
