
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AttendanceDatePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function AttendanceDatePicker({ date, setDate }: AttendanceDatePickerProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(format(date, "MMMM"));
  const [selectedYear, setSelectedYear] = useState<string>(format(date, "yyyy"));

  // Handle month change
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    const newDate = new Date(date);
    newDate.setMonth(getMonthIndex(month));
    setDate(newDate);
  };

  // Handle year change
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const newDate = new Date(date);
    newDate.setFullYear(parseInt(year, 10));
    setDate(newDate);
  };

  // Get month index from name
  const getMonthIndex = (month: string): number => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months.findIndex(m => m === month);
  };

  // Get years for dropdown
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());
  };

  return (
    <div className="flex flex-wrap gap-2">
      <div>
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="January">January</SelectItem>
            <SelectItem value="February">February</SelectItem>
            <SelectItem value="March">March</SelectItem>
            <SelectItem value="April">April</SelectItem>
            <SelectItem value="May">May</SelectItem>
            <SelectItem value="June">June</SelectItem>
            <SelectItem value="July">July</SelectItem>
            <SelectItem value="August">August</SelectItem>
            <SelectItem value="September">September</SelectItem>
            <SelectItem value="October">October</SelectItem>
            <SelectItem value="November">November</SelectItem>
            <SelectItem value="December">December</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select value={selectedYear} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {getYears().map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
