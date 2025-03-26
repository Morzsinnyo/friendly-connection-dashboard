import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Copy, Calendar, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CalendarSettings } from "@/components/calendar/CalendarSettings";
import { useUserProfile } from "@/hooks/contacts/useUserProfile";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
export default function Settings() {
  const {
    toast
  } = useToast();
  const {
    data: profile,
    refetch
  } = useUserProfile();
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState<string>("english");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const serviceAccountEmail = "calendar-integration@aesthetic-genre-447912-m8.iam.gserviceaccount.com";
  const handleCopy = () => {
    navigator.clipboard.writeText(serviceAccountEmail);
    toast({
      description: "Service account email copied to clipboard"
    });
  };
  return <div className="container mx-auto space-y-6 max-w-3xl px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Settings</h1>
      
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
          <CardTitle>Feedback</CardTitle>
          <CardDescription>
            Share your thoughts and help us improve the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Have suggestions?</h3>
              <p className="text-sm text-muted-foreground">
                We'd love to hear your thoughts on how we can make the app better.
              </p>
            </div>
            <Button onClick={() => setIsFeedbackOpen(true)} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Give Feedback
            </Button>
          </div>
          
          <FeedbackModal open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tutorial</CardTitle>
          <CardDescription>
            Watch these videos to learn how to use the application effectively.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeLanguage} onValueChange={setActiveLanguage} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="english">English</TabsTrigger>
              <TabsTrigger value="hungarian">Hungarian</TabsTrigger>
            </TabsList>
            
            <TabsContent value="english" className="mt-0">
              <div style={{
              position: "relative",
              paddingBottom: "62.5%",
              height: 0
            }}>
                <iframe src="https://www.loom.com/embed/703b30411d7a4aa39ea288f3e8fea4cf?sid=fde605dd-2f67-45f9-83e8-a923aa0969b6" frameBorder="0" allowFullScreen style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%"
              }} />
              </div>
            </TabsContent>
            
            <TabsContent value="hungarian" className="mt-0">
              <div className="relative w-full" style={{
              paddingBottom: "62.5%"
            }}>
                <iframe src="https://www.loom.com/embed/7113f12571e14d33b5616615c391dae9?sid=8f424735-4701-405a-9e20-9b9dc52ec960" frameBorder="0" allowFullScreen className="absolute top-0 left-0 w-full h-full rounded-lg" />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <p className="text-sm text-muted-foreground break-all flex-1">{serviceAccountEmail}</p>
            <Button variant="outline" size="sm" onClick={handleCopy} className="w-full sm:w-auto">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <CalendarSettings calendarId={profile?.calendar_id || null} onCalendarIdUpdate={() => refetch()} isSettingsOpen={isSettingsOpen} onSettingsOpenChange={setIsSettingsOpen} />
          <Button variant="default" size="sm" onClick={() => window.open('https://calendar.google.com/', '_blank')} className="w-full sm:w-auto bg-[#a7ff83] mx-0 my-[12px] px-[10px]">
            <Calendar className="h-4 w-4 mr-2" />
            Google Calendar
          </Button>
        </CardContent>
      </Card>
    </div>;
}