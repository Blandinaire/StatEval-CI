import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({ affectations }) {

    function supprimer(id) {

        if (confirm("Voulez-vous vraiment supprimer cette affectation ?")) {

            router.delete(route("affectations.destroy", id));

        }

    }

    return (

        <AdminLayout>

            <Head title="Affectations" />

            <div className="space-y-6">

                <div className="flex items-center justify-between">

                    <div>

                        <h1 className="text-3xl font-bold">
                            Affectations
                        </h1>

                        <p className="text-gray-500">
                            Gestion des affectations des enseignants
                        </p>

                    </div>

                    <Link
                        href={route("affectations.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                    >
                        + Nouvelle affectation
                    </Link>

                </div>

                <div className="overflow-hidden rounded-xl border bg-white shadow">

                    <table className="w-full">

                        <thead className="bg-gray-100">

                            <tr>

                                <th className="p-3 text-left">Classe</th>

                                <th className="p-3 text-left">Matière</th>

                                <th className="p-3 text-left">Enseignant</th>

                                <th className="p-3 text-left">Année</th>

                                <th className="p-3 text-center">Coefficient</th>

                                <th className="p-3 text-center">Volume</th>

                                <th className="p-3 text-center">Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {affectations.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="p-6 text-center text-gray-500"
                                    >
                                        Aucune affectation enregistrée.
                                    </td>

                                </tr>

                            ) : (

                                affectations.map((item) => (

                                    <tr
                                        key={item.id}
                                        className="border-t hover:bg-gray-50"
                                    >

                                        <td className="p-3">
                                            {item.classe?.libelle}
                                        </td>

                                        <td className="p-3">
                                            {item.matiere?.libelle}
                                        </td>

                                        <td className="p-3">
                                            {item.enseignant?.nom}{" "}
                                            {item.enseignant?.prenoms}
                                        </td>

                                        <td className="p-3">
                                            {item.annee_scolaire?.libelle}
                                        </td>

                                        <td className="p-3 text-center">
                                            {item.coefficient}
                                        </td>

                                        <td className="p-3 text-center">
                                            {item.volume_horaire}
                                        </td>

                                        <td className="p-3">

                                            <div className="flex justify-center gap-2">

                                                <Link
                                                    href={route(
                                                        "affectations.edit",
                                                        item.id
                                                    )}
                                                    className="rounded bg-blue-600 px-3 py-1 text-white"
                                                >
                                                    Modifier
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        supprimer(item.id)
                                                    }
                                                    className="rounded bg-red-600 px-3 py-1 text-white"
                                                >
                                                    Supprimer
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </AdminLayout>

    );

}