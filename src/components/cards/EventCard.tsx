import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate >= new Date();

  return (
    <Card className="h-full hover:shadow-lg transition-shadow flex flex-col">
      <Link href={`/events/${event.slug}`} className="flex-1 flex flex-col">
        <div className="relative w-full h-40 sm:h-48">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
          {event.featured && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs">
              Featured
            </Badge>
          )}
          {!isUpcoming && (
            <Badge variant="outline" className="absolute top-2 left-2 text-xs">
              Past Event
            </Badge>
          )}
        </div>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="line-clamp-2 text-base sm:text-lg">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs sm:text-sm">{event.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-1 sm:space-y-2 p-4 sm:p-6 pt-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{eventDate.toLocaleDateString()}</span>
          </div>
          {event.time && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{event.time}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          {event.type && (
            <Badge variant="outline" className="mt-2 text-xs">
              {event.type}
            </Badge>
          )}
        </CardContent>
        <CardFooter className="p-4 sm:p-6">
          <span className="text-xs sm:text-sm text-primary hover:underline">Learn more →</span>
        </CardFooter>
      </Link>
    </Card>
  );
}

