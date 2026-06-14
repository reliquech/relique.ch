"use client";

import { useState, useEffect } from "react";
import { EventCard } from "@/components/cards/EventCard";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { contentService } from "@/lib/services/contentService";
import type { Event } from "@/lib/types";

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      const allEvents = await contentService.events.list(true);
      // Ensure events have required fields with defaults
      const eventsWithDefaults = allEvents.map((e) => ({
        ...e,
        description: e.description ?? "",
        location: e.location ?? "",
        image: e.image ?? "",
        time: (e as any).time,
        type: (e as any).type,
        featured: (e as any).featured ?? false,
      })) as Event[];
      setEvents(eventsWithDefaults.slice(0, 3));
    };
    loadEvents();
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Upcoming Events"
        description="Join us at upcoming showcases, auctions, and appearances"
        cta={{
          label: "View All Events",
          href: "/events",
        }}
      />
      <div className="grid md:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

