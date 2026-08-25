import PortfolioChrome from "@/components/portfolio/PortfolioChrome";

// Rendered once and preserved across navigation within this group, so the rail
// never re-mounts — only the page content below it swaps.
export default function PortfolioLayout({ children }) {
  return <PortfolioChrome>{children}</PortfolioChrome>;
}
