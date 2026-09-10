export const PLAN_CATEGORIES = [
  { value: "travel", label: "Travel", chip: "bg-sea-soft text-sea", dot: "bg-sea" },
  { value: "stay", label: "Stay", chip: "bg-sage-soft text-sage", dot: "bg-sage" },
  { value: "food", label: "Food", chip: "bg-clay-soft text-clay", dot: "bg-clay" },
  { value: "explore", label: "Explore", chip: "bg-sun-soft text-sun", dot: "bg-sun" },
  { value: "note", label: "Note", chip: "bg-sand-deep text-muted", dot: "bg-muted" },
] as const;

export const COST_CATEGORIES = [
  { value: "food", label: "Food & drink", chip: "bg-clay-soft text-clay" },
  { value: "stay", label: "Stay", chip: "bg-sage-soft text-sage" },
  { value: "travel", label: "Travel", chip: "bg-sea-soft text-sea" },
  { value: "fun", label: "Fun", chip: "bg-sun-soft text-sun" },
  { value: "general", label: "General", chip: "bg-sand-deep text-muted" },
] as const;

export function planCategory(value: string) {
  return PLAN_CATEGORIES.find((c) => c.value === value) ?? PLAN_CATEGORIES[3];
}

export function costCategory(value: string) {
  return COST_CATEGORIES.find((c) => c.value === value) ?? COST_CATEGORIES[4];
}
