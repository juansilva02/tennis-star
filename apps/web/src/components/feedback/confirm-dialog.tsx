"use client";

import { AlertDialog as AD } from "radix-ui";
import { Button } from "@/components/ui/button";


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
        <AD.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/50" />
        <AD.Content className="dialog-panel fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 outline-none">
        <div className="rounded-xl border bg-background p-6 shadow-xl">
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
        </div>
        </AD.Content>
      </AD.Portal>
    </AD.Root>
  );
}
