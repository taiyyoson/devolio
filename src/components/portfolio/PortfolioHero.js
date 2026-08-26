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
              What got me into engineering? Problem solving induces dopamine.
            </p>
            <p>
              I&apos;m currently based in the San Francisco Bay Area, but I&apos;m from Hawaii (yes I can surf) and born in Japan. Besides programming, I like to build video games, tinker, do photography, hike, and snowboard. I volunteer at a garden. I practice with a semi-professional soccer team, and I&apos;m a professional spikeball player.
              </p> 

            <p>
              My last internship at Fastly was where I really got into specialized dsitributed systems and infrastructure. I built an API tool to probe ephemeral edge cache nodes and test their internal components.  
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
