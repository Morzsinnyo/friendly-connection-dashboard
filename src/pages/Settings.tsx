import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const serviceAccountEmail = "calendar-integration@aesthetic-genre-447912-m8.iam.gserviceaccount.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(serviceAccountEmail);
    toast({
      description: "Service account email copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto space-y-6 max-w-3xl px-3 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Settings</h1>
      
      <Card className="shadow-sm">
        <CardHeader className="space-y-2 sm:space-y-3">
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks and feels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Theme</h3>
              <p className="text-sm text-muted-foreground">
                Select your preferred theme
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="space-y-2 sm:space-y-3">
          <CardTitle>Tutorial</CardTitle>
          <CardDescription>
            Watch this video to learn how to use the application effectively.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: "62.5%" }}>
            <iframe 
              src="https://www.loom.com/embed/7113f12571e14d33b5616615c391dae9?sid=8f424735-4701-405a-9e20-9b9dc52ec960" 
              frameBorder="0" 
              allowFullScreen 
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-full sm:flex-1 space-y-1.5">
              <label className="text-sm font-medium">Service Account Email</label>
              <p className="text-sm text-muted-foreground break-all bg-muted/50 p-2 rounded-md">
                {serviceAccountEmail}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy} 
              className="w-full sm:w-auto mt-2 sm:mt-0"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}