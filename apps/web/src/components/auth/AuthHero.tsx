export function AuthHero() {
  return (
    <section className="relative hidden overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="text-lg font-bold">Tennis Star</div>
      <div className="relative z-10 max-w-lg">
        <p className="mb-4 text-sm font-medium uppercase tracking-[.25em] text-emerald-400">
          Administración eficiente
        </p>
        <h2 className="text-5xl font-semibold leading-tight">
          Todo tu negocio,
          <br />
          en una sola cancha.
        </h2>
        <p className="mt-5 text-zinc-400">
          Productos, clientes y ventas con una experiencia rápida y clara.
        </p>
      </div>
      <div className="absolute -bottom-40 -right-32 size-[34rem] rounded-full border-[90px] border-lime-300/80" />
      <p className="text-xs text-zinc-500">© 2026 Tennis Star</p>
    </section>
  );
}