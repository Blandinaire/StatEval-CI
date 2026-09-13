import { useState } from "react";

import { usePage, Link, useForm } from "@inertiajs/react";

import { Bell, Search, ChevronDown, User, LogOut, Menu } from "lucide-react";

export default function Header({ onMenuClick }) {
    const { auth = {} } = usePage().props;

    const [openUserMenu, setOpenUserMenu] = useState(false);

    const { post, processing } = useForm();

    const user = auth?.user;

    const role = user?.role ?? user?.roles?.[0]?.name ?? "Utilisateur";

    const handleLogout = () => {
        post(route("logout"));
    };

    return (
        <header className="relative flex min-h-[64px] w-full min-w-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 shadow-sm sm:min-h-[72px] sm:gap-3 sm:px-6 lg:px-8">
            {/* =====================================================
                PARTIE GAUCHE
            ===================================================== */}

            <div className="flex min-w-0 items-center gap-3">
                {/* =================================================
                    BOUTON MENU MOBILE
                ================================================= */}

                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden"
                    aria-label="Ouvrir le menu"
                >
                    <Menu size={24} />
                </button>

                {/* =================================================
                    TITRE
                ================================================= */}

                <div className="min-w-0">
                    <h1 className="truncate text-lg font-bold text-gray-800 sm:text-2xl">
                        Tableau de bord
                    </h1>

                    <p className="hidden text-sm text-gray-500 sm:block">
                        Bienvenue sur StatEval-CI
                    </p>
                </div>
            </div>

            {/* =====================================================
                PARTIE DROITE
            ===================================================== */}

            <div className="relative flex shrink-0 items-center gap-1 sm:gap-4 lg:gap-6">
                {/* =================================================
                    RECHERCHE
                ================================================= */}

                <div className="relative hidden md:block">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-56 rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none lg:w-72"
                    />
                </div>

                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <button
                    type="button"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
                    aria-label="Notifications"
                >
                    <Bell size={21} />

                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                </button>

                {/* =================================================
                    UTILISATEUR
                ================================================= */}

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setOpenUserMenu((previous) => !previous)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-50 focus:outline-none sm:gap-3 sm:px-3"
                    >
                        {/* =========================================
                            ICÔNE UTILISATEUR MOBILE
                        ========================================= */}

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <User size={19} />
                        </div>

                        {/* =========================================
                            NOM UTILISATEUR
                        ========================================= */}

                        <div className="hidden text-right sm:block">
                            <p className="max-w-[180px] truncate font-semibold text-gray-800">
                                {user?.name ?? "Utilisateur"}
                            </p>

                            <p className="text-sm text-gray-500">{role}</p>
                        </div>

                        {/* =========================================
                            CHEVRON
                        ========================================= */}

                        <ChevronDown
                            size={18}
                            className={`hidden text-gray-500 transition-transform sm:block ${
                                openUserMenu ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {/* =================================================
                        MENU UTILISATEUR
                    ================================================= */}

                    {openUserMenu && (
                        <div className="absolute right-0 top-full z-[100] mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                            {/* =========================================
                                INFORMATIONS
                            ========================================= */}

                            <div className="border-b border-gray-100 px-4 py-4">
                                <p className="font-semibold text-gray-800">
                                    {user?.name ?? "Utilisateur"}
                                </p>

                                <p className="mt-1 truncate text-xs text-gray-500">
                                    {user?.email ?? ""}
                                </p>

                                <p className="mt-2 text-xs font-semibold text-blue-600">
                                    {role}
                                </p>
                            </div>

                            {/* =========================================
                                PROFIL
                            ========================================= */}

                            <Link
                                href={route("profile.edit")}
                                onClick={() => setOpenUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <User size={18} />

                                <span>Mon profil</span>
                            </Link>

                            {/* =========================================
                                DÉCONNEXION
                            ========================================= */}

                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <LogOut size={18} />

                                <span>
                                    {processing
                                        ? "Déconnexion..."
                                        : "Déconnexion"}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
