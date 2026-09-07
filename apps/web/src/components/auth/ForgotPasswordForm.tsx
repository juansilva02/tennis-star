"use client";

import { useState } from "react";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ForgotPasswordFormProps {
    onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
    const [sent, setSent] = useState(false);

    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        await api("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email: f.get("email") }),
        });
        setSent(true);
    }

    if (sent) {
        return (
            <div className="space-y-5">
                <h2 className="text-xl font-semibold">Revisá tu correo</h2>
                <p className="text-sm text-muted-foreground">
                    Si la cuenta existe, vas a recibir instrucciones. Esta función es una
                    demostración y no envía correos reales.
                </p>
                <Button variant="outline" className="w-full" onClick={onBack}>
                    Volver al inicio de sesión
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-5">
            <h2 className="text-xl font-semibold">Recuperar acceso</h2>
            <p className="text-sm text-muted-foreground">
                Ingresá tu correo para continuar.
            </p>
            <label className="block text-sm font-medium">
                Correo electrónico
                <Input name="email" type="email" className="mt-2" required />
            </label>
            <Button className="w-full">Continuar</Button>
            <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
                Volver
            </Button>
        </form>
    );
}
