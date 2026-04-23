export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="flex shrink-0 justify-center px-6 pb-6 pt-10 md:px-12 md:pt-12">
        <p className="font-black text-lg uppercase tracking-[0.2em] text-secondary">
          MyTax+
        </p>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 md:px-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
