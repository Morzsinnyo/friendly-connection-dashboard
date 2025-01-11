import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RelationshipCardProps {
  friendshipScore: number;
  relatedContacts: Array<{
    name: string;
    email: string;
    avatar: string;
  }>;
}

export function RelationshipCard({ friendshipScore, relatedContacts }: RelationshipCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relationship Strength</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Friendship Score</span>
              <span className="text-sm text-gray-600">{friendshipScore}%</span>
            </div>
            <Progress value={friendshipScore} className="h-2" />
            <p className="text-sm text-gray-600">Strong Connection</p>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Family Members</h4>
            <div className="space-y-2">
              {relatedContacts.map((contact, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-gray-600">{contact.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Networking Score</h4>
            <div className="flex items-center space-x-2">
              <Progress value={85} className="h-2 flex-grow" />
              <span className="text-sm text-gray-600">85%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}