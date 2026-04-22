// Auth gating happens in src/proxy.ts which redirects unauthenticated
// requests away from /host/* (except /host/login).
export default function HostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
