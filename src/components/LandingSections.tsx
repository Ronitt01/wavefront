import { Stakes } from "./landing/Stakes";
import { HowItWorks } from "./landing/HowItWorks";
import { TheScience } from "./landing/TheScience";
import { Scenarios } from "./landing/Scenarios";
import { Faq } from "./landing/Faq";
import { FinalCta } from "./landing/FinalCta";
import { SiteFooter } from "./landing/SiteFooter";

/**
 * LandingSections — server component that composes the marketing sections
 * rendered beneath the WavefrontExperience hero, in narrative order.
 */
export function LandingSections() {
  return (
    <>
      <Stakes />
      <HowItWorks />
      <TheScience />
      <Scenarios />
      <Faq />
      <FinalCta />
      <SiteFooter />
    </>
  );
}
