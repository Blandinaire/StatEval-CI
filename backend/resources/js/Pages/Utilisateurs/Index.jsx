import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Index() {
    const [menuOuvert, setMenuOuvert] = useState(null);
    const { users = [], flash = {} } = usePage().props;

    const toggleUser = (user) => {
        if (
            !confirm(
                user.actif
                    ? `Voulez-vous désactiver le compte de ${user.name} ?`
                    : `Voulez-vous réactiver le compte de ${user.name} ?`,
            )
        ) {
            return;
        }

        router.patch(route("users.toggle", user.id));
    };

    const resetPassword = (user) => {
        if (
            !confirm(
                `Voulez-vous vraiment réinitialiser le mot de passe de ${user.name} ?\n\nUn nouveau mot de passe sera généré et l'utilisateur devra le changer à sa prochaine connexion.`,
            )
        ) {
            return;
        }

        router.patch(route("users.reset-password", user.id));
    };

    const deleteUser = (user) => {
        if (
            !confirm(
                `Voulez-vous vraiment supprimer le compte de ${user.name} ?`,
            )
        ) {
            return;
        }

        router.delete(route("users.destroy", user.id));
    };

    const getRole = (user) => {
        if (!user.roles || user.roles.length === 0) {
            return "Aucun rôle";
        }

        return user.roles.map((role) => role.name).join(", ");
    };

    return (
        <AdminLayout>
            <Head title="Gestion des utilisateurs" />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* EN-TÊTE */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Gestion des utilisateurs
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Gestion des comptes, rôles, fonctions et accès à
                            SchoolManager CI.
                        </p>
                    </div>

                    <Link
                        href={route("users.create")}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        + Nouvel utilisateur
                    </Link>
                </div>

                {/* MESSAGES */}
                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                        <strong>✓ Succès :</strong> {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                        <strong>⚠ Erreur :</strong> {flash.error}
                    </div>
                )}

                {/* STATISTIQUES */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total utilisateurs
                        </p>
                        <p className="mt-2 text-3xl font-bold text-gray-800">
                            {users.length}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Comptes actifs</p>
                        <p className="mt-2 text-3xl font-bold text-green-600">
                            {users.filter((user) => user.actif).length}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Comptes désactivés
                        </p>
                        <p className="mt-2 text-3xl font-bold text-red-600">
                            {users.filter((user) => !user.actif).length}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Rôles utilisés</p>
                        <p className="mt-2 text-3xl font-bold text-blue-600">
                            {
                                new Set(
                                    users.flatMap((user) =>
                                        (user.roles || []).map(
                                            (role) => role.name,
                                        ),
                                    ),
                                ).size
                            }
                        </p>
                    </div>
                </div>

                {/* TABLEAU */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="border-b bg-slate-50 px-6 py-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            Liste des utilisateurs
                        </h2>
                    </div>

                    {users.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            Aucun utilisateur enregistré.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-sm font-semibold">
                                            Utilisateur
                                        </th>

                                        <th className="px-5 py-4 text-left text-sm font-semibold">
                                            Fonction
                                        </th>

                                        <th className="px-5 py-4 text-left text-sm font-semibold">
                                            Rôle
                                        </th>

                                        <th className="px-5 py-4 text-left text-sm font-semibold">
                                            Établissement
                                        </th>

                                        <th className="px-5 py-4 text-left text-sm font-semibold">
                                            Accès initial
                                        </th>

                                        <th className="px-5 py-4 text-center text-sm font-semibold">
                                            Statut
                                        </th>

                                        <th className="px-5 py-4 text-right text-sm font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-gray-800">
                                                    {user.name}
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-gray-700">
                                                {user.fonction || "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                    {getRole(user)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-gray-700">
                                                {user.etablissement?.nom || "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                {user.must_change_password &&
                                                user.initial_password ? (
                                                    <div>
                                                        <div className="mb-1 text-xs font-semibold uppercase text-orange-600">
                                                            Mot de passe initial
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <span className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 font-mono text-sm font-bold text-orange-800">
                                                                {
                                                                    user.initial_password
                                                                }
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    try {
                                                                        await navigator.clipboard.writeText(
                                                                            user.initial_password,
                                                                        );
                                                                        alert(
                                                                            "Mot de passe copié.",
                                                                        );
                                                                    } catch {
                                                                        alert(
                                                                            "Impossible de copier automatiquement le mot de passe.",
                                                                        );
                                                                    }
                                                                }}
                                                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                            >
                                                                📋 Copier
                                                            </button>
                                                        </div>

                                                        <div className="mt-1 text-xs text-orange-600">
                                                            À changer à la
                                                            première connexion
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        — Aucun
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                {user.actif ? (
                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                        Actif
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                        Désactivé
                                                    </span>
                                                )}
                                            </td>

                                            <td className="relative px-5 py-4">
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setMenuOuvert(
                                                                menuOuvert ===
                                                                    user.id
                                                                    ? null
                                                                    : user.id,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Actions
                                                        <span className="text-lg leading-none">
                                                            ⋮
                                                        </span>
                                                    </button>

                                                    {menuOuvert === user.id && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="fixed inset-0 z-10 cursor-default"
                                                                onClick={() =>
                                                                    setMenuOuvert(
                                                                        null,
                                                                    )
                                                                }
                                                                aria-label="Fermer le menu"
                                                            />

                                                            <div className="absolute right-5 top-14 z-20 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                                                                <Link
                                                                    href={route(
                                                                        "users.edit",
                                                                        user.id,
                                                                    )}
                                                                    onClick={() =>
                                                                        setMenuOuvert(
                                                                            null,
                                                                        )
                                                                    }
                                                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    ✏️
                                                                    <span>
                                                                        Modifier
                                                                    </span>
                                                                </Link>

                                                                {!user.roles?.some(
                                                                    (role) =>
                                                                        role.name ===
                                                                        "SuperAdmin",
                                                                ) && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setMenuOuvert(
                                                                                null,
                                                                            );
                                                                            resetPassword(
                                                                                user,
                                                                            );
                                                                        }}
                                                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-purple-700 hover:bg-purple-50"
                                                                    >
                                                                        🔑
                                                                        <span>
                                                                            Réinitialiser
                                                                        </span>
                                                                    </button>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setMenuOuvert(
                                                                            null,
                                                                        );
                                                                        toggleUser(
                                                                            user,
                                                                        );
                                                                    }}
                                                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${
                                                                        user.actif
                                                                            ? "text-orange-700 hover:bg-orange-50"
                                                                            : "text-green-700 hover:bg-green-50"
                                                                    }`}
                                                                >
                                                                    {user.actif
                                                                        ? "⏸️"
                                                                        : "▶️"}
                                                                    <span>
                                                                        {user.actif
                                                                            ? "Désactiver"
                                                                            : "Activer"}
                                                                    </span>
                                                                </button>

                                                                <div className="my-1 border-t border-gray-100" />

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setMenuOuvert(
                                                                            null,
                                                                        );
                                                                        deleteUser(
                                                                            user,
                                                                        );
                                                                    }}
                                                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
                                                                >
                                                                    🗑️
                                                                    <span>
                                                                        Supprimer
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
