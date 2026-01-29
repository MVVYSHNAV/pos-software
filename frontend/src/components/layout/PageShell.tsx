export default function PageShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-screen bg-background text-foreground">
      {children}
    </div>
  )
}

