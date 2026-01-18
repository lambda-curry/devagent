import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { MarkdownContent } from './Markdown';

interface MarkdownSectionProps {
  title: string;
  content: string | null;
  icon?: LucideIcon;
  className?: string;
}

/**
 * MarkdownSection renders a titled section with markdown content.
 *
 * Features:
 * - Consistent styling across all markdown sections
 * - Optional icon prefix for the title
 * - Returns null if content is empty or null
 * - Uses MarkdownContent for safe markdown rendering
 *
 * Performance:
 * - Component is memoized to prevent unnecessary re-renders
 * - Only re-renders when props actually change
 *
 * Usage:
 * <MarkdownSection title="Description" content={task.description} icon={FileText} />
 */
export const MarkdownSection = memo(({ title, content, icon: Icon, className = '' }: MarkdownSectionProps) => {
  // Don't render if content is empty or null
  if (!content || content.trim() === '') {
    return null;
  }

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="text-muted-foreground">
        <MarkdownContent>{content}</MarkdownContent>
      </div>
    </div>
  );
});

MarkdownSection.displayName = 'MarkdownSection';
