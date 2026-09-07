"use client";
import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;
export function DialogContent({
  children,
  className,
  ...p
}: React.ComponentProps<typeof D.Content>) {
  return (
    <D.Portal>
      <D.Overlay asChild>
        <motion.div
          className="fixed inset-0 z-50 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.16 }}
        />
      </D.Overlay>
      <D.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 outline-none",
          className,
        )}
        {...p}
      >
        <motion.div
          className="max-h-[90dvh] overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
          initial={{ opacity: 0, scale: 0.985, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
          <D.Close
            aria-label="Cerrar"
            className="absolute right-3 top-3 grid size-11 place-items-center rounded-lg hover:bg-muted"
          >
            <X className="size-4" />
          </D.Close>
        </motion.div>
      </D.Content>
    </D.Portal>
  );
}
export const DialogTitle = ({
  className,
  ...p
}: React.ComponentProps<typeof D.Title>) => (
  <D.Title className={cn("text-lg font-semibold", className)} {...p} />
);
export const DialogDescription = ({
  className,
  ...p
}: React.ComponentProps<typeof D.Description>) => (
  <D.Description
    className={cn("mt-1 text-sm text-muted-foreground", className)}
    {...p}
  />
);
