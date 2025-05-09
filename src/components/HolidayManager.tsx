
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { mockHolidays } from "@/lib/googleSheetsService";
import { useToast } from "@/hooks/use-toast";

interface Holiday {
  date: string; // DD-MM-YYYY
  name: string;
}

export function HolidayManager() {
  const [holidays, setHolidays] = useState<Holiday[]>(mockHolidays);
  const [newHoliday, setNewHoliday] = useState<Holiday>({
    date: "",
    name: ""
  });
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setNewHoliday({
        ...newHoliday,
        date: format(selectedDate, "dd-MM-yyyy")
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewHoliday({
      ...newHoliday,
      name: e.target.value
    });
  };

  const handleAddHoliday = () => {
    if (newHoliday.date && newHoliday.name) {
      setHolidays([...holidays, newHoliday]);
      setNewHoliday({ date: "", name: "" });
      setDate(undefined);
      setOpen(false);
      
      toast({
        title: "Holiday Added",
        description: `${newHoliday.name} (${newHoliday.date}) has been added to the holiday list.`
      });
    }
  };

  const handleRemoveHoliday = (index: number) => {
    const updatedHolidays = [...holidays];
    updatedHolidays.splice(index, 1);
    setHolidays(updatedHolidays);
    
    toast({
      title: "Holiday Removed",
      description: "The holiday has been removed from the list."
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Holidays</h3>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center">
              <Plus className="h-4 w-4 mr-1" /> Add Holiday
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Holiday</DialogTitle>
              <DialogDescription>
                Add a new holiday to the attendance system.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="holiday-date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="holiday-date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="holiday-name">Holiday Name</Label>
                <Input
                  id="holiday-name"
                  value={newHoliday.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Independence Day"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={handleAddHoliday}
                disabled={!newHoliday.date || !newHoliday.name}
              >
                Add Holiday
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        {holidays.length > 0 ? (
          <ul className="divide-y">
            {holidays.map((holiday, index) => (
              <li key={index} className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium">{holiday.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {holiday.date}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveHoliday(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center py-6 text-muted-foreground">
            No holidays added yet.
          </p>
        )}
      </div>
    </div>
  );
}
