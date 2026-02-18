export default function PortfolioFooter({ onSwitchToTerminal }) {
  return (
    <footer className="border-t border-border mt-16 py-8 text-sm text-muted">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-4">
          <a
            href="https://github.com/taiyyoson"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            github
          </a>
          <a
            href="https://linkedin.com/in/taiyo-williamson"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            linkedin
          </a>
          <a
            href="mailto:taiyo@dons.usfca.edu"
            className="hover:text-foreground transition-colors"
          >
            email
          </a>
        </div>
        <button
          onClick={onSwitchToTerminal}
          className="font-mono hover:text-foreground transition-colors text-left sm:text-right"
        >
          {">"}_&nbsp;terminal
        </button>
      </div>
    </footer>
  );
}
