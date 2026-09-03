export default function PortfolioFooter() {
  return (
    <footer className="border-t border-border mt-12 pt-6 pb-12 text-sm text-muted">
      <div className="flex items-center justify-between">
        <span>© 2026 Taiyo Williamson.</span>
        <div className="flex items-center gap-4">
          <a
            href="mailto:tpwilliamson@dons.usfca.edu"
            className="hover:text-foreground transition-colors"
            aria-label="Email"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
          </a>
          <a
            href="https://github.com/taiyyoson-games"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
            aria-label="Game studio on GitHub"
            >
              <svg width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"><rect x="2"
            y="6" width="20" height="12" rx="3"/><path d="M6
            12h4"/><path d="M8 10v4"/><path d="M15 13h.01"/><path
            d="M18 11h.01"/></svg>
          </a>
          <a
            href="https://github.com/taiyyoson"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.27.73-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.15v3.18c0 .31.21.67.79.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>
          </a>
          <a
            href="https://linkedin.com/in/taiyowson"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
            aria-label="LinkedIn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05a4.16 4.16 0 0 1 3.75-2.05c4 0 4.75 2.63 4.75 6.05V21H17.4v-5.5c0-1.31-.03-3-1.83-3-1.83 0-2.11 1.43-2.11 2.91V21H9V9Z"/></svg>
          </a>
          <a
            href="/resume.pdf"
            download
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            aria-label="Download resume"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>
            <span>Resume</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
