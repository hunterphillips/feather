import {
  FileText,
  Users,
  Settings,
  Plus,
  X,
  Paperclip,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Users,
  Settings,
  Plus,
  X,
  Paperclip,
};

export function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] || FileText;
}
