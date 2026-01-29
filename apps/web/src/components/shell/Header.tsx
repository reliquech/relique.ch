"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReliqueMark } from "@/components/logo";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setHeight = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${el.getBoundingClientRect().height}px`
      );
    };
    setHeight();
    const ro = new ResizeObserver(setHeight);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--header-height");
    };
  }, []);

  const navItems = [
    { href: "/authenticate", label: "Authenticate" },
    { href: "/marketplace", label: "Consigned Marketplace" },
    { href: "/verify", label: "Verify" },
    { href: "/consign", label: "Consign" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const handleNavClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  if (searchParams.get("preview") === "1") return null;

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[60] transition-all duration-500",
          scrolled
            ? "py-3 sm:py-4 bg-bgDark/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
            : "py-4 sm:py-6 md:py-8 bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="group transition-transform active:scale-95">
            <ReliqueMark 
              size={scrolled ? "md" : "lg"}
              className="tracking-wide"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-colors relative group",
                    isActive ? "text-highlightIce" : "text-white hover:text-highlightIce"
                  )}
                >
                  {item.label}
                  <motion.span
                    className="absolute -bottom-2 left-0 h-[1.5px] bg-primaryBlue"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 flex flex-col justify-center items-end gap-1 sm:gap-1.5 cursor-pointer group p-1 relative z-[70]"
              aria-label="Toggle Menu"
            >
              <motion.div
                animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-white group-hover:bg-highlightIce transition-colors"
              />
              <motion.div
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-2/3 h-0.5 bg-white group-hover:w-full group-hover:bg-highlightIce transition-all"
              />
              <motion.div
                animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-white group-hover:bg-highlightIce transition-colors"
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-bgDark/90 backdrop-blur-sm z-[65] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[90%] sm:w-[85%] max-w-md bg-cardDark border-l border-white/10 z-[66] p-8 sm:p-10 md:p-12 lg:hidden flex flex-col justify-center"
            >
              <div className="mb-12 sm:mb-16">
                <span className="text-primaryBlue font-black text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-3 sm:mb-4 block">
                  Navigation Menu
                </span>
                <div className="h-0.5 w-10 sm:w-12 bg-primaryBlue" />
              </div>
              <nav className="flex flex-col gap-6 sm:gap-8">
                {navItems.map((item, idx) => (
                  <motion.button
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    onClick={() => handleNavClick(item.href)}
                    className="text-left"
                  >
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white hover:text-primaryBlue transition-colors block leading-none">
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </nav>
              <div className="mt-16 sm:mt-24 pt-8 sm:pt-12 border-t border-white/5">
                <p className="text-[9px] sm:text-[10px] font-black uppercase text-white/30 tracking-widest mb-3 sm:mb-4">Support</p>
                <a href="mailto:customersupport@relique.ch" className="text-xs sm:text-sm font-bold text-highlightIce break-all">
                  customersupport@relique.ch
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
