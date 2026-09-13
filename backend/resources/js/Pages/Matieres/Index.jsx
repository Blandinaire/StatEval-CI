import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Pencil, Trash2 } from "lucide-react";

import DataTable from "@/Components/DataTable/DataTable";

export default function Index({ matieres }) {
    const { auth } = usePage().props;

    const user = auth?.user;

    const role = user?.roles?.[0]?.name ?? user?.role ?? "Utilisateur";

    const isSuperAdmin = role === "SuperAdmin";

    function supprimer(id) {
        if (confirm("Voulez-vous supprimer cette matière ?")) {
            router.delete(route("matieres.destroy", id));
        }
    }

    const columns = [
        {
            key: "couleur",
            label: "Couleur",
            render: (row) => (
                <div
                    className="w-8 h-8 rounded-full border"
                    style={{
                        backgroundColor: row.couleur,
                    }}
                />
            ),
        },
        {
            key: "libelle",
            label: "Libellé",
        },
        {
            key: "parent",
            label: "Matière principale",
            render: (row) => row.parent?.libelle ?? "—",
        },
        {
            key: "code",
            label: "Code",
        },
        {
            key: "active",
            label: "Statut",
            render: (row) =>
                row.active ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        Active
                    </span>
                ) : (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        Inactive
                    </span>
                ),
        },
    ];

    if (isSuperAdmin) {
        columns.push({
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex gap-2">
                    <Link
                        href={route("matieres.edit", row.id)}
                        aria-label="Modifier la matière"
                        title="Modifier la matière"
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 md:gap-1 md:px-4 md:py-2"
                    >
                        <Pencil size={16} />
                        <span className="hidden md:inline">Modifier</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => supprimer(row.id)}
                        aria-label="Supprimer la matière"
                        title="Supprimer la matière"
                        className="inline-flex items-center justify-center rounded-lg bg-red-600 p-2 text-white hover:bg-red-700 md:gap-1 md:px-4 md:py-2"
                    >
                        <Trash2 size={16} />
                        <span className="hidden md:inline">Supprimer</span>
                    </button>
                </div>
            ),
        });
    }

    return (
        <AdminLayout>
            <Head title="Matières" />
            <div className="bg-white rounded-xl shadow">
                <ResponsiveTable minWidth="800px">
                    <DataTable
                        title="Matières"
                        columns={columns}
                        data={matieres}
                        createLink={
                            isSuperAdmin ? route("matieres.create") : null
                        }
                        createLabel="Nouvelle matière"
                    />
                </ResponsiveTable>
            </div>
        </AdminLayout>
    );
}
