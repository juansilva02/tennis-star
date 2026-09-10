"use client";
import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
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
      <D.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/50" />
      <D.Content
        className={cn(
          "dialog-panel fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 outline-none",
          className,
        )}
        {...p}
      >
        <div
          className="max-h-[90dvh] overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
        >
          {children}
          <D.Close
            aria-label="Cerrar"
            className="absolute right-3 top-3 grid size-11 place-items-center rounded-lg hover:bg-muted"
          >
            <X className="size-4" />
          </D.Close>
        </div>
      </D.Content>
    </D.Portal>
  );
}
export const DialogTitle = ({
  className,
  ...p
}: React.ComponentProps<typeof D.Title>) => (
  <D.Title className={cn("break-words pr-8 text-lg font-semibold", className)} {...p} />
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
