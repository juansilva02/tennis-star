function requireTestCredential(name: "ADMIN_EMAIL" | "ADMIN_PASSWORD") {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Falta ${name}. Configurala antes de ejecutar las pruebas E2E.`,
    );
  }
  return value;
}

export const testAdminEmail = requireTestCredential("ADMIN_EMAIL");
export const testAdminPassword = requireTestCredential("ADMIN_PASSWORD");
