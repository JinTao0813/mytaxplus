export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/40 flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
