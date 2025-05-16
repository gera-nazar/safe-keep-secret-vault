
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Key } from 'lucide-react';

interface EmptyPasswordListProps {
  searchQuery?: string;
}

export const EmptyPasswordList: React.FC<EmptyPasswordListProps> = ({ searchQuery }) => {
  return (
    <TableRow>
      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
        <div className="flex flex-col items-center space-y-2">
          <Key className="h-8 w-8" />
          <p>No passwords found</p>
          {searchQuery ? (
            <p className="text-sm">Try a different search term</p>
          ) : (
            <p className="text-sm">Add your first password to get started</p>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
