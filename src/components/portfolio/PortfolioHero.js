import Image from "next/image";
import Link from "next/link";
const LINK = "text-accent underline underline-offset-2 hover:text-accent-hover transition-colors";

export default function PortfolioHero() {
  return (
    <section id="about" className="pt-4 pb-16">
      <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-start">
        <div className="flex-1">
          <h1 className="font-ramaraja text-xl font-semibold tracking-wide text-foreground mb-8">
            TAIYO WILLIAMSON
          </h1>
          <div className="space-y-5 text-foreground/90 leading-relaxed">
            <p>
              I&apos;m a software engineer in distributed systems,
              infrastructure, and frontier AI. I enjoy building edge-cache tooling, homelabbing,
              self-hosting, and learning new technologies that excite me.
            </p>
            <p>
              What got me into engineering? Problem solving induces dopamine.
            </p>
            <p>
              I&apos;m currently based in the San Francisco Bay Area, but I&apos;m from Hawaii (yes I can surf) and born in Japan. Off the keyboard, I like to build video games, tinker, do photography, hike, and snowboard. I volunteer at a garden. I practice with a semi-professional soccer team, and I&apos;m a professional spikeball player.
              </p> 

            <p>
              In summer 2025 I was on the Embedded team at{" "}
              <a href="https://www.fastly.com" target="_blank" rel="noopener noreferrer" className={LINK}>
                Fastly
              </a>
              , where I built a Go tool that probes ephemeral edge-cache nodes and
              exercises their compute and observability internals. It ships as a Helm
              chart and runs in CI on a private Kubernetes cluster. That job is what really opened my eyes to infra.
            </p>           
          </div>
        </div>
        <Image
          src="/images/devolio-img1.JPG"
          alt="Taiyo Williamson"
          width={2149}
          height={2149}
          priority
          className="w-80 h-80 shrink-0 rounded-lg object-cover"
        />
      </div>
    </section>
  );
}
