import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({ classes }) {
    function supprimer(id) {
        if (confirm("Voulez-vous vraiment supprimer cette classe ?")) {
            router.delete(route("classes.destroy", id));
        }
    }

    return (
        <AdminLayout>
            <Head title="Classes" />

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Classes</h1>

                        <p className="text-gray-500 mt-1">
                            Gestion des classes
                        </p>
                    </div>

                    <Link
                        href={route("classes.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                    >
                        + Nouvelle classe
                    </Link>
                </div>

               <div className="bg-white rounded-xl shadow">
    <ResponsiveTable minWidth="750px">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4 text-left">Libellé</th>
                                <th className="p-4 text-left">Niveau</th>
                                <th className="p-4 text-left">
                                    Année scolaire
                                </th>
                                <th className="p-4 text-center">Capacité</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {classes.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-8 text-center text-gray-500"
                                    >
                                        Aucune classe enregistrée.
                                    </td>
                                </tr>
                            ) : (
                                classes.map((classe) => (
                                    <tr key={classe.id} className="border-t">
                                        <td className="p-4 font-semibold">
                                            {classe.libelle}
                                        </td>

                                        <td className="p-4">
                                            {classe.niveau?.libelle}
                                        </td>

                                        <td className="p-4">
                                            {classe.annee_scolaire?.libelle}
                                        </td>

                                        <td className="p-4 text-center">
                                            {classe.capacite}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={route(
                                                        "classes.edit",
                                                        classe.id,
                                                    )}
                                                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                                >
                                                    Modifier
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        supprimer(classe.id)
                                                    }
                                                    className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </ResponsiveTable>
                </div>
            </div>
        </AdminLayout>
    );
}
