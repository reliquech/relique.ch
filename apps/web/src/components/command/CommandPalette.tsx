"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { initializeActions, searchActions, getAllActions } from "@/lib/actions/actionRegistry";
import type { Action } from "@/lib/actions/types";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadActions = async () => {
      await initializeActions(pathname);
      setActions(getAllActions());
    };
    loadActions();
  }, [pathname]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (action: Action) => {
    action.perform({
      currentPath: pathname,
      router,
    });
    setOpen(false);
  };

  const filteredActions = open ? searchActions("") : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="rounded-none border-0">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {["Navigate", "Create", "Utilities", "Verify", "Marketplace"].map((group) => {
              const groupActions = actions.filter((a) => a.group === group);
              if (groupActions.length === 0) return null;
              
              return (
                <CommandGroup key={group} heading={group}>
                  {groupActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <CommandItem
                        key={action.id}
                        onSelect={() => handleSelect(action)}
                        value={action.label}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{action.label}</span>
                        {action.shortcut && (
                          <CommandShortcut>{action.shortcut}</CommandShortcut>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

