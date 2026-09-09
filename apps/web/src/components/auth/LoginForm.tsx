"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { api } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/errors";

interface LoginFormProps {
    onForgotClick: () => void;
}

export function LoginForm({ onForgotClick }: LoginFormProps) {
    const router = useRouter();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const f = new FormData(e.currentTarget);
        try {
            await api("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: f.get("email"),
                    password: f.get("password"),
                    rememberMe: f.get("rememberMe") === "on",
                }),
            });
            router.replace("/home");
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-5">
            <label className="block text-sm font-medium">
                Correo electrónico
                <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="mt-2"
                    required
                />
            </label>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Contraseña
              </label>
                <div className="relative mt-2">
                    <Input
                        id="password"
                        name="password"
                        type={show ? "text" : "password"}
                        autoComplete="current-password"
                        className="pr-12"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-0 top-0 grid size-11 place-items-center"
                        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {show ? (
                            <EyeOff className="size-4" />
                        ) : (
                            <Eye className="size-4" />
                        )}
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2">
                    <input
                        name="rememberMe"
                        type="checkbox"
                        className="size-4 accent-zinc-900"
                    />
                    Mantener sesión
                </label>
                <button
                    type="button"
                    onClick={onForgotClick}
                    className="font-medium underline-offset-4 hover:underline"
                >
                    ¿Olvidaste tu contraseña?
                </button>
            </div>
            {error && (
                <p
                    role="alert"
                    className="rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
                >
                    {error}
                </p>
            )}
            <Button className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}Entrar
            </Button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />O continuá con
                <span className="h-px flex-1 bg-border" />
            </div>
            <SocialLoginButtons />
        </form>
    );
}
