
import React, { useState } from 'react';
import { toast } from 'sonner';
import { PasswordEntry } from '../services/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Copy,
  MoreVertical,
  Edit,
  Trash,
  Search,
  Key
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface PasswordListProps {
  passwords: PasswordEntry[];
  onEdit: (entry: PasswordEntry) => void;
  onDelete: (id: number) => void;
  onSearch: (query: string) => void;
}

const PasswordList: React.FC<PasswordListProps> = ({
  passwords,
  onEdit,
  onDelete,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const confirmDelete = (id: number, siteName: string) => {
    if (confirm(`Are you sure you want to delete the entry for "${siteName}"?`)) {
      onDelete(id);
    }
  };

  return (
    <Card className="w-full">
      <div className="p-4 flex items-center space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search passwords..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-220px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[240px]">Site</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passwords.length === 0 ? (
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
            ) : (
              passwords.map((entry) => (
                <TableRow key={entry.id}>
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
                        {visiblePasswords[entry.id as number] 
                          ? entry.password 
                          : '••••••••'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => togglePasswordVisibility(entry.id as number)}
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
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};

export default PasswordList;
