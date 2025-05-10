
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  className,
  trend = "neutral",
  icon: Icon
}: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      default: return "text-blue-600";
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardDescription className="text-sm text-muted-foreground flex items-center gap-1.5">
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", getTrendColor())}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
