
import React from 'react';
import { toast } from 'sonner';
import { PasswordEntry } from '../services/database';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Eye, Copy, MoreVertical, Edit, Trash } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface PasswordItemProps {
  entry: PasswordEntry;
  isVisible: boolean;
  onToggleVisibility: (id: number) => void;
  onEdit: (entry: PasswordEntry) => void;
  onDelete: (id: number) => void;
}

export const PasswordItem: React.FC<PasswordItemProps> = ({
  entry,
  isVisible,
  onToggleVisibility,
  onEdit,
  onDelete
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

  const confirmDelete = (id: number, siteName: string) => {
    if (confirm(`Are you sure you want to delete the entry for "${siteName}"?`)) {
      onDelete(id);
    }
  };

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
            onClick={() => onToggleVisibility(entry.id as number)}
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
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(entry)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => confirmDelete(entry.id as number, entry.site_name)}
              className="text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
