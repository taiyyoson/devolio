import Image from "next/image";

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
              I&apos;m a software engineer in distributed systems, cloud
              infrastructure, and frontier AI. I enjoy building edge-cache tooling, homelabbing,
              self-hosting, and learning new technologies that excite me.
            </p>
            <p>
              
              </p>            
          </div>
        </div>
        <Image
          src="/images/cover-image-placeholder.jpeg"
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
