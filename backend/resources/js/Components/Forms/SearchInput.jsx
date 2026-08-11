import { Search } from "lucide-react";

export default function SearchInput({
    value,
    onChange,
    placeholder = "Rechercher...",
}) {
    return (
        <div className="relative">

            <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
            />

            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
            />

        </div>
    );
}