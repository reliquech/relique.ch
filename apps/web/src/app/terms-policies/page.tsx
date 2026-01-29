"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import { policySections, tableOfContents } from "@/data/terms-policies.data";

export default function TermsAndPoliciesPage() {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState("introduction");
  const isPreview = searchParams.get("preview") === "1";

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      
      for (const section of tableOfContents) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.getBoundingClientRect().top + window.pageYOffset;
          const height = element.offsetHeight;
          
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 100;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveSection(id);
    }
  };

  return (
    <div className="py-24 bg-bgDark min-h-screen">
      {!isPreview && (
        <motion.div
          className="fixed left-0 right-0 h-1 bg-primaryBlue origin-left z-40"
          style={{ top: "var(--header-height, 5rem)", scaleX }}
        />
      )}
      
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-semibold uppercase italic tracking-tighter mb-8 leading-none" style={{ fontFamily: 'var(--font-zapf-renaissance), serif' }}>
            Terms and <span className="text-primaryBlue">Policies</span>
          </h1>
          <p className="text-textSec text-xl font-medium">For Consignment Sales and Authentication Services</p>
        </motion.div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-16 relative">
          <aside className="hidden lg:block">
            <div className="sticky top-32 h-fit">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primaryBlue mb-8">Table of Contents</h4>
                <nav className="flex flex-col gap-1 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/5" />
                  
                  {tableOfContents.map((section, idx) => {
                    const isActive = activeSection === section.id;
                    return (
                      <motion.button
                        key={section.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        onClick={() => scrollToSection(section.id)}
                        className={`text-left py-2 pl-4 text-[10px] font-black uppercase tracking-widest transition-all relative border-l-2 outline-none ${
                          isActive 
                          ? 'text-highlightIce border-primaryBlue bg-primaryBlue/5' 
                          : 'text-white/40 border-transparent hover:text-white/80 hover:bg-white/5'
                        }`}
                      >
                        {section.title}
                        {isActive && (
                          <motion.div 
                            layoutId="activePointer"
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-1 h-1 bg-highlightIce rounded-full shadow-[0_0_8px_#BDE8F5]"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </nav>
              </motion.div>
            </div>
          </aside>

          <div className="space-y-20 text-textSec leading-relaxed text-lg font-medium">
            {policySections.map((section) => (
              <section key={section.id} id={section.id} className="space-y-6">
                <h2 className="text-3xl font-medium text-highlightIce" style={{ fontFamily: 'var(--font-zapf-renaissance), serif' }}>
                  {section.title}
                </h2>
                
                <div className="space-y-6">
                  {section.content.map((block, idx) => {
                    if (block.type === 'paragraph') {
                      return <p key={idx}>{block.text}</p>;
                    }
                    
                    if (block.type === 'notice') {
                      return (
                        <div key={idx} className="bg-primaryBlue/10 p-8 border-l-4 border-primaryBlue italic">
                          <p className="text-white font-bold uppercase text-xs tracking-widest mb-2">
                            {block.label}
                          </p>
                          {block.text}
                        </div>
                      );
                    }
                    
                    if (block.type === 'subsection' && block.items) {
                      return (
                        <div key={idx} className="space-y-4">
                          {block.items.map((item, itemIdx) => (
                            <p key={itemIdx}>
                              <span className="text-white font-bold">{item.subtitle}</span> {item.description}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    
                    return null;
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
