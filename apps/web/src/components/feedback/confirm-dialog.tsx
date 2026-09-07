"use client";

import { AlertDialog as AD } from "radix-ui";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  onConfirm,
  destructive = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
}) {
  return (
    <AD.Root open={open} onOpenChange={onOpenChange}>
      <AD.Portal>
        <AD.Overlay asChild>
          <motion.div className="fixed inset-0 z-50 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.16 }} />
        </AD.Overlay>
        <AD.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 outline-none">
        <motion.div className="rounded-xl border bg-background p-6 shadow-xl" initial={{ opacity: 0, scale: 0.985, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <AD.Title className="text-lg font-semibold">{title}</AD.Title>
          <AD.Description className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </AD.Description>
          <div className="mt-6 flex justify-end gap-2">
            <AD.Cancel asChild>
              <Button variant="outline">Cancelar</Button>
            </AD.Cancel>
            <AD.Action asChild>
              <Button
                variant={destructive ? "destructive" : "default"}
                onClick={onConfirm}
              >
                {actionLabel}
              </Button>
            </AD.Action>
          </div>
        </motion.div>
        </AD.Content>
      </AD.Portal>
    </AD.Root>
  );
}
