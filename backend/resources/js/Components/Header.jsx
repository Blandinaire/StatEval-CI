import { usePage } from "@inertiajs/react";
import { Bell, Search } from "lucide-react";

export default function Header() {
    const { auth = {} } = usePage().props;

    return (
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Tableau de bord
                </h1>

                <p className="text-sm text-gray-500">
                    Bienvenue sur StatEval-CI
                </p>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-72 rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <button
                    type="button"
                    className="relative rounded-full p-2 hover:bg-gray-100"
                >
                    <Bell size={22} />

                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                <div className="text-right">
                    <p className="font-semibold text-gray-800">
                        {auth?.user?.name ?? "Administrateur"}
                    </p>

                    <p className="text-sm text-gray-500">Administrateur</p>
                </div>
            </div>
        </header>
    );
}
