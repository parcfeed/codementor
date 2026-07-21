type BadgeDisplayProps = {
  name: string;
  description: string;
  icon: string;
};

export function BadgeDisplay({ name, description, icon }: BadgeDisplayProps) {
  return (
    <div className="app-card flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
        {icon}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </div>
  );
}
