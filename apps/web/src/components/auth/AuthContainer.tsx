"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export function AuthContainer() {
  const [isForgot, setIsForgot] = useState(false);

  return (
    <section className="flex items-center justify-center p-5 sm:p-10">
      <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
        <CardContent className="p-6 sm:p-8">
          {!isForgot && (
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight">
                Iniciá sesión
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Ingresá a tu cuenta para continuar
              </p>
            </div>
          )}

          {isForgot ? (
            <ForgotPasswordForm onBack={() => setIsForgot(false)} />
          ) : (
            <LoginForm onForgotClick={() => setIsForgot(true)} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}