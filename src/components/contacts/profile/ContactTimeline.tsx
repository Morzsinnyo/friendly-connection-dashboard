import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContactTimelineProps {
  timeline: Array<{
    type: string;
    date: string;
    description: string;
    icon: React.ReactNode;
  }>;
}

export function ContactTimeline({ timeline }: ContactTimelineProps) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.map((event, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="bg-gray-100 p-2 rounded-full">
                {event.icon}
              </div>
              <div>
                <p className="font-medium">{event.description}</p>
                <p className="text-sm text-gray-600">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}