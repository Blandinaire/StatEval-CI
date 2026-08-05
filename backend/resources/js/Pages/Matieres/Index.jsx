import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";

export default function Index({ matieres }) {

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
                    style={{ backgroundColor: row.couleur }}
                />
            ),
        },
        {
            key: "libelle",
            label: "Libellé",
        },
        {
            key: "code",
            label: "Code",
        },
        {
            key: "coefficient",
            label: "Coefficient",
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
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex gap-2">
                    <Link
                        href={route("matieres.edit", row.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Modifier
                    </Link>

                    <button
                        onClick={() => supprimer(row.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Supprimer
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>

            <Head title="Matières" />

            <DataTable
                title="Matières"
                columns={columns}
                data={matieres}
                createLink={route("matieres.create")}
                createLabel="Nouvelle matière"
            />

        </AdminLayout>
    );
}