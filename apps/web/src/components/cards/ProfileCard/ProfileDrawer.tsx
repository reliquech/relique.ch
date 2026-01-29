"use client";

import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ExtendedTeamMember } from "./types";

interface ProfileDrawerProps {
  member: ExtendedTeamMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sectionVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

/**
 * ProfileDrawer - Full bio drawer with 2-column layout
 * Left: Overview + Technical Stack | Right: Credentials
 */
export function ProfileDrawer({ member, open, onOpenChange }: ProfileDrawerProps) {
  const { fullBio } = member;
  const hasContent = fullBio?.overview || (member.credentials?.length ?? 0) > 0 || (member.technicalStack?.length ?? 0) > 0;
  const displayEmail = member.sub || fullBio?.links?.email;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "w-full sm:max-w-[75%]",
          "bg-cardDark border-l border-white/10",
          "overflow-y-auto",
          "pt-28 px-6 sm:px-8 pb-6",
          "[&>button]:fixed [&>button]:top-[5.5rem] sm:[&>button]:top-[6rem] [&>button]:right-[2rem]"
        )}
      >
        <SheetHeader className="space-y-4 pb-6 border-b border-white/10">
          <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
            <SheetTitle className="text-3xl font-bold tracking-tight text-white">
              {member.name}
            </SheetTitle>
            <p className="text-primaryBlue font-black text-[10px] uppercase mt-2">
              {member.role}
            </p>
            {displayEmail && (
              <p className="font-medium text-sm text-white/60 leading-relaxed">
                {displayEmail}
              </p>
            )}
          </motion.div>
        </SheetHeader>

        <div className="mt-6">
          {hasContent ? (
            <TwoColumnContent member={member} />
          ) : (
            <NoContentFallback />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TwoColumnContent({ member }: { member: ExtendedTeamMember }) {
  const { fullBio, credentials, technicalStack } = member;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        {fullBio?.overview && (
          <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
            <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-4">
              Overview
            </h4>
            <div className="space-y-4">
              {fullBio.overview.split(/\n\n+/).map((p, i) => (
                <p key={i} className="text-textSec text-sm leading-6 pl-4">
                  {p}
                </p>
              ))}
            </div>
          </motion.div>
        )}
        {technicalStack && technicalStack.length > 0 && (
          <TechnicalStackSection stack={technicalStack} />
        )}
      </div>

      {credentials && credentials.length > 0 && (
        <CredentialsSection credentials={credentials} />
      )}
    </div>
  );
}

function CredentialsSection({ credentials }: { credentials: string[] }) {
  return (
    <motion.div custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
      <div className="space-y-6">
        <h4 className="text-white font-bold text-sm uppercase tracking-wide">
          Credentials
        </h4>
        <div className="space-y-0">
          {credentials.map((line, index) => (
            <div key={index} className="flex gap-4 relative">
              {index < credentials.length - 1 && (
                <div className="absolute left-[11px] top-1 bottom-0 w-[2px] bg-primaryBlue/30" />
              )}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primaryBlue border-4 border-cardDark relative z-10" />
              <div className="flex-1 pb-6">
                <p className="text-white font-semibold text-base leading-relaxed">
                  {line}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TechnicalStackSection({
  stack,
}: {
  stack: { heading: string; items: string[] }[];
}) {
  return (
    <motion.div custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
      <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-4">
        Technical Stack
      </h4>
      <div className="space-y-4">
        {stack.map(({ heading, items }, i) => (
          <div key={i}>
            <p className="text-primaryBlue text-xs font-bold uppercase tracking-wide mb-2">
              {heading}
            </p>
            <p className="text-textSec text-sm leading-6">
              {items.join(" · ")}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function NoContentFallback() {
  return (
    <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
      <p className="text-textSec text-sm">No profile details available.</p>
    </motion.div>
  );
}
