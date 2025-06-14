
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const SearchBar = ({ searchTerm, onSearchChange }: SearchBarProps) => {
  return (
    <div className="flex items-center gap-2">
      <Search className="w-4 h-4 text-slate-500" />
      <Input
        placeholder="Search users by name, email, or department..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-md"
      />
    </div>
  );
};
