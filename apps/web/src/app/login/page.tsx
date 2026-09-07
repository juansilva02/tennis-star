import { AuthHero } from "@/components/auth/AuthHero";
import { AuthContainer } from "@/components/auth/AuthContainer";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_.95fr]">
      <AuthHero />
      <AuthContainer />
    </main>
  );
}