import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Settings() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks and feels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Theme</h3>
              <p className="text-sm text-muted-foreground">
                Select your preferred theme
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tutorial</CardTitle>
          <CardDescription>
            Watch this video to learn how to use the application effectively.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full" style={{ paddingBottom: "62.5%" }}>
            <iframe 
              src="https://www.loom.com/embed/7113f12571e14d33b5616615c391dae9?sid=8f424735-4701-405a-9e20-9b9dc52ec960" 
              frameBorder="0" 
              allowFullScreen 
              className="absolute top-0 left-0 w-full h-full rounded-lg"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}