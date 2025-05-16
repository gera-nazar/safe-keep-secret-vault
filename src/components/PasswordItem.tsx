
import React from 'react';
import { toast } from 'sonner';
import { PasswordEntry } from '../services/vaultFile';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Eye, Copy } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface PasswordItemProps {
  entry: PasswordEntry;
  isVisible: boolean;
  onToggleVisibility: (id: number) => void;
}

export const PasswordItem: React.FC<PasswordItemProps> = ({
  entry,
  isVisible,
  onToggleVisibility
}) => {
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Use the entry id if available, otherwise use the index (which is passed as id)
  const itemId = typeof entry.id === 'number' ? entry.id : 0;

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{entry.site_name}</div>
        {entry.site_url && (
          <div className="text-xs text-muted-foreground truncate max-w-[230px]">
            {entry.site_url}
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <span className="truncate max-w-[160px]">{entry.username}</span>
          {entry.username && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => copyToClipboard(entry.username, 'Username')}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <span className="font-mono">
            {isVisible ? entry.password : '••••••••'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onToggleVisibility(itemId)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => copyToClipboard(entry.password, 'Password')}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {formatDate(entry.modified_at)}
        </Badge>
      </TableCell>
    </TableRow>
  );
};
