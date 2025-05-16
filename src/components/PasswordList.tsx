
import React, { useState } from 'react';
import { PasswordEntry } from '../services/vaultFile';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from "@/components/ui/scroll-area";
import { PasswordItem } from './PasswordItem';
import { EmptyPasswordList } from './EmptyPasswordList';
import { SearchBar } from './SearchBar';

interface PasswordListProps {
  passwords: PasswordEntry[];
  onSearch: (query: string) => void;
}

const PasswordList: React.FC<PasswordListProps> = ({
  passwords,
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <Card className="w-full">
      <div className="p-4 flex items-center space-x-2">
        <SearchBar value={searchQuery} onChange={handleSearchChange} />
      </div>

      <ScrollArea className="h-[calc(100vh-220px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[240px]">Site</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Modified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passwords.length === 0 ? (
              <EmptyPasswordList searchQuery={searchQuery} />
            ) : (
              passwords.map((entry, index) => (
                <PasswordItem
                  key={entry.id || index}
                  entry={entry}
                  isVisible={visiblePasswords[entry.id as number || index] || false}
                  onToggleVisibility={togglePasswordVisibility}
                />
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};

export default PasswordList;
