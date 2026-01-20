import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { List, Calendar } from 'lucide-react';

export type ViewMode = 'list' | 'week';

interface WeekViewToggleProps {
  viewMode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

export function WeekViewToggle({ viewMode, onToggle }: WeekViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(value) => value && onToggle(value as ViewMode)}
      className="bg-white/50 rounded-soft p-1"
    >
      <ToggleGroupItem
        value="list"
        aria-label="List view"
        className="px-2 py-1 rounded-soft data-[state=on]:bg-white data-[state=on]:shadow-soft"
      >
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="week"
        aria-label="Week view"
        className="px-2 py-1 rounded-soft data-[state=on]:bg-white data-[state=on]:shadow-soft"
      >
        <Calendar className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
