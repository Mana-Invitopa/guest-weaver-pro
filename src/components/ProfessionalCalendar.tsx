import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  time: string;
  color?: string;
}

interface ProfessionalCalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export default function ProfessionalCalendar({ 
  events = [], 
  onDateSelect,
  onEventClick 
}: ProfessionalCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: fr });
  const calendarEnd = endOfWeek(monthEnd, { locale: fr });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    onDateSelect?.(day);
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="space-y-4">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-accent" />
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="text-xs"
              >
                Aujourd'hui
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevMonth}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  className="h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div
                key={day}
                className="text-center text-xs md:text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "min-h-[60px] md:min-h-[80px] p-1 md:p-2 rounded-lg border transition-all",
                    "hover:border-accent hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
                    isCurrentMonth ? "bg-card" : "bg-muted/30",
                    isTodayDate && "border-accent bg-accent/5 font-semibold",
                    isSelected && "ring-2 ring-accent shadow-md",
                    !isCurrentMonth && "text-muted-foreground"
                  )}
                >
                  <div className="flex flex-col h-full">
                    <span className={cn(
                      "text-xs md:text-sm mb-1",
                      isTodayDate && "text-accent font-bold"
                    )}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex-1 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                          className={cn(
                            "text-[10px] md:text-xs px-1 py-0.5 rounded truncate",
                            event.color || "bg-primary/10 text-primary"
                          )}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] md:text-[10px] text-muted-foreground text-center">
                          +{dayEvents.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day events */}
      {selectedDate && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDay(selectedDate).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun événement ce jour
              </p>
            ) : (
              <div className="space-y-3">
                {getEventsForDay(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:border-accent hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-accent" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm md:text-base truncate">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0 text-xs">
                      Programmé
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
