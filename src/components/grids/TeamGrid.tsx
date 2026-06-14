import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface TeamGridProps {
  title?: string;
  people: TeamMember[];
  className?: string;
}

export function TeamGrid({ title, people, className }: TeamGridProps) {
  if (people.length === 0) return null;

  return (
    <section className={cn("space-y-6 sm:space-y-8", className)}>
      {title && <h2 className="text-h2 text-center">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {people.map((person) => (
          <Card key={person.id}>
            <CardHeader className="p-4 sm:p-6">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4">
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardTitle className="text-base sm:text-lg">{person.name}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{person.role}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground">{person.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

