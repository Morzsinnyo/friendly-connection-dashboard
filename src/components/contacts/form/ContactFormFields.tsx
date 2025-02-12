import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, User, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ContactFormFieldsProps {
  formData: {
    fullName: string;
    email: string;
    businessPhone: string;
    mobilePhone: string;
    status: string;
    birthday: Date | null;
    notes: string;
    jobTitle: string;
    company: string;
  };
  errors: {
    fullName: string;
    email: string;
  };
  setFormData: (data: any) => void;
  statusOptions: string[];
}

export function ContactFormFields({ formData, errors, setFormData, statusOptions }: ContactFormFieldsProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleYearSelect = (year: string) => {
    const currentDate = formData.birthday || new Date();
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(year));
    setFormData({ ...formData, birthday: newDate });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName" className="text-foreground">
          <User className="w-4 h-4 inline mr-2" />
          Full Name *
        </Label>
        <Input
          id="fullName"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className={cn(
            "bg-background border-border text-foreground focus-visible:ring-ring",
            errors.fullName && "border-destructive"
          )}
        />
        {errors.fullName && (
          <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
        )}
      </div>

      <div>
        <Label htmlFor="jobTitle" className="text-foreground">
          <Briefcase className="w-4 h-4 inline mr-2" />
          Job Title
        </Label>
        <Input
          id="jobTitle"
          value={formData.jobTitle}
          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
          className="bg-background border-border text-foreground focus-visible:ring-ring"
        />
      </div>

      <div>
        <Label htmlFor="company" className="text-foreground">
          <Briefcase className="w-4 h-4 inline mr-2" />
          Company
        </Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="bg-background border-border text-foreground focus-visible:ring-ring"
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-foreground">
          <Mail className="w-4 h-4 inline mr-2" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={cn(
            "bg-background border-border text-foreground focus-visible:ring-ring",
            errors.email && "border-destructive"
          )}
        />
        {errors.email && (
          <p className="text-destructive text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="mobilePhone" className="text-foreground">
          <Phone className="w-4 h-4 inline mr-2" />
          Mobile Phone
        </Label>
        <Input
          id="mobilePhone"
          value={formData.mobilePhone}
          onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
          className="bg-background border-border text-foreground focus-visible:ring-ring"
        />
      </div>

      <div>
        <Label htmlFor="businessPhone" className="text-foreground">
          <Phone className="w-4 h-4 inline mr-2" />
          Business Phone
        </Label>
        <Input
          id="businessPhone"
          value={formData.businessPhone}
          onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
          className="bg-background border-border text-foreground focus-visible:ring-ring"
        />
      </div>

      <div>
        <Label htmlFor="status" className="text-foreground">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger className="bg-background border-border text-foreground">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status} className="text-foreground">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">
          <CalendarIcon className="w-4 h-4 inline mr-2" />
          Birthday
        </Label>
        <div className="flex gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.birthday && "text-muted-foreground"
                )}
              >
                {formData.birthday ? (
                  format(formData.birthday, "MMM d")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.birthday || undefined}
                onSelect={(date) => setFormData({ ...formData, birthday: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Select
            value={formData.birthday ? formData.birthday.getFullYear().toString() : ""}
            onValueChange={handleYearSelect}
          >
            <SelectTrigger className="bg-background border-border text-foreground w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border max-h-[200px]">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()} className="text-foreground">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes" className="text-foreground">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="bg-background border-border text-foreground focus-visible:ring-ring min-h-[100px]"
        />
      </div>
    </div>
  );
}