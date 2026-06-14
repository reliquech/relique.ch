"use client";

import { motion } from "framer-motion";
import { StrategicPartnerSection } from "../../(home)/components/StrategicPartnerSection";
import { TeamSection } from "../../(home)/components/TeamSection";

/** Chỉnh độ sáng ảnh Who We Are (0 = tối hết, 1 = gốc). Ví dụ: 0.85, 0.9 */
const WHO_WE_ARE_IMG_BRIGHTNESS = 0.85;

export default function AboutPage() {
  return (
    <div className="bg-bgDark pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-full md:max-w-5xl">
        {/* 4.1 WHO WE ARE */}
        <motion.section
          id="who-we-are"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-16 sm:py-20 md:py-24 border-b border-white/5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mb-8 sm:mb-12">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-none border-b-2 border-primaryBlue w-fit pb-2">
                Who We Are - The Relique Story
              </h1>
              <p className="pt-4 text-textSec text-base sm:text-lg leading-relaxed font-medium">
                Relique was founded by a group of financial professionals with extensive experience in
                managing investment funds and high-value assets, in a quest for a new investment vehicle. Drawing on years
                of exposure to global capital markets, we recognized that memorabilia possesses all the characteristics of
                a legitimate financial asset—scarcity, provenance, and enduring value—yet has been held back by
                inconsistent verification and fragmented infrastructure.
              </p>
            </div>
            <div className="aspect-square rounded-sm border border-white/10 overflow-hidden relative">
              <img
                src="/mock-images/whoweareimage.jpg"
                alt="Who We Are - The Relique Story"
                className="w-full h-full object-cover brightness-90 contrast-[1.5]"
              />
              <div className="absolute inset-0 bg-black/15 pointer-events-none" aria-hidden />
            </div>
          </div>
          <div className="space-y-6 sm:space-y-8 text-textSec text-base sm:text-lg leading-relaxed font-medium">
            <p>
              Determined to transform this space, the team set out to address the barriers that have historically
              limited memorabilia&apos;s capacity as an investment asset. By combining rigorous financial discipline with
              strategic insight, we aim to design a platform capable of delivering objectivity, transparency, and
              scalability, elevating memorabilia from mere collectibles to credible assets that investors and collectors
              can trust.
            </p>
            <div className="bg-primaryBlue/5 border-l-4 border-primaryBlue p-8 italic">
              &quot;To realize this vision, Relique chose St.B as its strategic partner and sponsor their AI
              engineering endeavor.&quot;
            </div>
            <p>
              Their deep expertise in artificial intelligence, established sporting ecosystem, and intimate understanding
              of the collectibles market provide critical capabilities. This partnership enables Relique to bridge the
              market knowledge gap and eradicate liability of foreignness, ensuring that every authentication and
              transaction meets the highest standard of credibility and reliability.
            </p>
            <p>
              Relique is redefining what it means for memorabilia to be both collectible and investable, creating a
              trusted foundation for a market ready to mature and thrive.
            </p>
          </div>
        </motion.section>

        {/* 4.2 INVESTMENT VEHICLE */}
        <motion.section
          id="investment-vehicle"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-24 border-b border-white/5"
        >
          <div className="mb-12">
            <h2 className="text-5xl font-bold tracking-tight mb-8 leading-none">
              One <span className="italic">To</span> Appreciate, And One <span className="italic"> That </span> Appreciate
            </h2>
          </div>
          <div className="space-y-8 text-textSec text-lg leading-relaxed">
            <p>
              The founders of Relique all have extensive experience working at financial funds in the United States,
              where investment decisions always revolve around three core factors:{" "}
              <span className="text-white font-bold">value – risk – trust</span>. Throughout that process, we witnessed:
            </p>
            <ul className="grid gap-6">
              {[
                "Traditional financial assets increasingly rely on intermediary trust.",
                "Fraud, manipulation, and geopolitical instability have shaken confidence in many assets.",
                "Global capital has begun seeking alternative asset classes that are clearly scarce.",
              ].map((point, i) => (
                <li
                  key={i}
                  className="flex gap-4 items-start bg-cardDark border border-white/5 p-6 group hover:border-primaryBlue transition-colors"
                >
                  <span className="w-8 h-8 bg-primaryBlue flex-none flex items-center justify-center font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-white font-bold">{point}</span>
                </li>
              ))}
            </ul>
            <p>
              From the perspective of asset managers with extensive background in institutional finance, we realized that memorabilia—items tied to people, events, and history that cannot be replicated—possess many of the characteristics of long-term valuable assets: objective scarcity, sustainable collector demand, and cultural value across time.
            </p>
            <figure className="my-10">
              <img
                src="/mock-images/maradona.png"
                alt="Diego Maradona 1986 World Cup Match Worn Shirt"
                className="w-full max-w-2xl mx-auto rounded-sm border border-white/10 object-cover"
              />
              <figcaption className="mt-3 text-sm text-textSec text-center max-w-2xl mx-auto leading-relaxed">
                Diego Maradona 1986 World Cup &apos;The Hand of God&apos; &amp; &apos;Goal of the Century&apos; Match Worn Shirt, sold for a record-breaking $9.3 million, fetched what is believed to be the highest price ever paid for a sports item.
              </figcaption>
            </figure>
            <p>
              Unlike most traditional financial assets, collectibles have an abstract value driven by a passionate base — much like fine art. According to Kiplinger, of the most reputable financial publication, the demand for sports collectibles has recorded unprecedented growth since the pandemic, outperforming even the S&P 500. Their valuation in the market is expected to have a CAGR of 21.8% over the next decade.
              The fact that Sotheby’s—whose past auctions include a $157.2 million Modigliani and a $139.4 million Picasso—has stepped into the sports memorabilia market speaks volume. We might as well be witnessing the emergence of a new blue chip investment class.
            </p>
            <div className="p-10 border-2 border-dashed border-white/10 text-center">
              <p className="text-2xl font-bold text-highlightIce">
                &quot;With each purchase, you&apos;re not simply acquiring an item, but rather investing in a financial
                asset imbued with a story, a memory, and a tangible connection to your sporting inspiration.&quot;
              </p>
            </div>
          </div>
        </motion.section>

        {/* 4.3 QUESTION OF TRUST */}
        <motion.section
          id="question-of-trust"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-24 border-b border-white/5"
        >
          <div className="mb-12">
            <h2 className="text-5xl font-bold tracking-tight mb-8 leading-none">
              A Question <span className="text-primaryBlue">of Trust</span>
            </h2>
          </div>
          <div className="space-y-8 text-textSec text-lg leading-relaxed">
            <p>
              With a background in institutional finance and capital management, our founders understand that every
              investment, irrespective of scale or form, rests upon one principle above all others:{" "}
              <span className="text-white font-bold">trust</span>. It is the single, uncompromising factor that
              ultimately determines the capacity, resilience, and credibility of any investment vehicle.
            </p>

            <div
              id="ai-powered"
              className="bg-cardDark p-12 border-2 border-primaryBlue relative overflow-hidden group"
            >
              <h3 className="text-3xl font-semibold text-highlightIce mb-8 relative z-10">
                Artificial Intelligence - A Natural Extension, Not a Pivot
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="aspect-square rounded-sm border border-white/10 overflow-hidden relative z-10">
                  <img
                    src="/mock-images/aiImage.png"
                    alt="AI-powered authentication"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-6 text-textSec text-base leading-relaxed md:pt-0">
                  <p>
                    In this day and age, conventional certification methods have unfortunately become extremely
                    vulnerable to forgery and digital manipulation. Expert opinions, while respected, are subjective and
                    hard to scale efficiently.
                  </p>
                  <p>
                    Relique believes that a rigorous AI-powered authentication technology is the answer we&apos;re looking
                    for, providing a reliable, scalable, and objective measure of authenticity.
                  </p>
                  <p>
                  For match-worn or used items, our AI virtually &quot;replays&quot; the event, analyzing every minute
                  detail from all footage available, including proprietary recordings and exclusive sources accessible
                  only to Relique. It will then be able to spot:
                </p>
                </div>
              </div>
              <div className="mt-8 space-y-6 text-textSec text-base leading-relaxed">

                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Fabric patterns and material stains to subtle environmental markers—at a level of attention and
                    consistency that no human could achieve.
                  </li>
                  <li>Variations, abrasions, and usage signatures across the entire object</li>
                </ul>
                <p>
                  Unlike humans, who are constrained by fatigue, limited focus, and the unavoidable subjectivity of
                  perception, the AI maintains relentless precision, capturing and comparing data points across
                  thousands of reference visual datasets to produce a complete and objective profile.
                </p>
                <p>
                  Whereas when it comes to autographs, our Artificial Intelligence model has access to an extensive
                  database of verified signature exemplars across the years and performs a multi-layered comparison. For
                  autographs, this encompasses a thorough assessment of subtle variances in patterns, pressure dynamics,
                  and signature morphology. It then further evaluates:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sequencing</li>
                  <li>Stroke order</li>
                  <li>Velocity fluctuations</li>
                  <li>Micro-tremor signatures on a level of precision that far exceeds the standard naked-eye capability.</li>
                </ul>
                <p>
                  The result is a high-confidence, data-driven and probabilistic assessment, each linked to a unique
                  product code and QR identifier to ensure traceability and integrity. The integration of Artificial
                  Intelligence is not a pivot, but rather a natural extension, aimed to elevate Memorabilias into a new
                  class of assets.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
      <StrategicPartnerSection />
      <TeamSection />
    </div>
  );
}
