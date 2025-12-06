import {
  FileText,
  Users,
  Settings,
  Plus,
  X,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Users,
  Settings,
  Plus,
  X,
};

export function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] || FileText;
}
