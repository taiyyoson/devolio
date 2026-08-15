import Link from "next/link";

export const metadata = {
  title: "404",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 font-mono">
      <p className="text-sm text-muted">
        <span className="text-accent">taiyo@devolio</span>
        <span className="text-muted">:</span>
        <span>~$ </span>
        cd {"<that page>"}
      </p>
      <p className="text-sm text-foreground">
        cd: no such file or directory
      </p>
      <Link
        href="/"
        className="mt-4 text-sm text-accent underline underline-offset-4 hover:text-accent-hover"
      >
        cd ~
      </Link>
    </main>
  );
}
