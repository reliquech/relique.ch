"use client";

import { EventCard } from "@/components/cards/EventCard";
import type { Event } from "@/lib/types";

interface EventTimelineProps {
  events: Event[];
}

export function EventTimeline({ events }: EventTimelineProps) {
  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const past = events.filter((e) => new Date(e.date) < new Date());

  return (
    <div className="space-y-12">
      {upcoming.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-h2">Upcoming Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-h2">Past Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

