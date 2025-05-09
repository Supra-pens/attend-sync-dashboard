
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ 
  title, 
  value, 
  description, 
  className,
  trend = "neutral"
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
        <CardDescription className="text-sm text-muted-foreground">
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
