import { AvailabilityCalendar } from "@/components/sites/ag-live/availability-calendar";
import { Book } from "@/components/sites/ag-live/book";
import { Clients } from "@/components/sites/ag-live/clients";
import { Hero } from "@/components/sites/ag-live/hero";
import { Lineups } from "@/components/sites/ag-live/lineups";
import { PageShell } from "@/components/sites/ag-live/page-shell";
import { SiteFooter } from "@/components/sites/ag-live/site-footer";
import { SiteNav } from "@/components/sites/ag-live/site-nav";
import { TheAct } from "@/components/sites/ag-live/the-act";
import { TheBand } from "@/components/sites/ag-live/the-band";
import { Ticker } from "@/components/sites/ag-live/ticker";
import { UpcomingShows } from "@/components/sites/ag-live/upcoming-shows";

export default function AgLivePage() {
  return (
    <PageShell>
      <SiteNav />
      <Hero />
      <Ticker />
      <TheAct />
      <Lineups />
      <UpcomingShows />
      <AvailabilityCalendar />
      <TheBand />
      <Clients />
      <Book />
      <SiteFooter />
    </PageShell>
  );
}