import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({ niveaux }) {

    function supprimer(id) {
        if (confirm("Voulez-vous vraiment supprimer ce niveau ?")) {
            router.delete(route("niveaux.destroy", id));
        }
    }

    return (
        <AdminLayout>

            <Head title="Niveaux scolaires" />

            <div className="max-w-7xl mx-auto">

                <div className="flex justify-between items-center mb-8">

                    <div>
                        <h1 className="text-3xl font-bold">
                            Niveaux scolaires
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Gestion des niveaux
                        </p>
                    </div>

                    <Link
                        href={route("niveaux.create")}
                        className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                    >
                        + Nouveau niveau
                    </Link>

                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">

                    <table className="w-full">

                        <thead className="bg-gray-100">

                            <tr>

                                <th className="text-left p-4">Libellé</th>

                                <th className="text-center p-4">Code</th>

                                <th className="text-center p-4">Ordre</th>

                                <th className="text-center p-4">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {niveaux.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="4"
                                        className="text-center p-10 text-gray-500"
                                    >
                                        Aucun niveau enregistré.
                                    </td>

                                </tr>

                            ) : (

                                niveaux.map((niveau) => (

                                    <tr
                                        key={niveau.id}
                                        className="border-t"
                                    >

                                        <td className="p-4 font-semibold">
                                            {niveau.libelle}
                                        </td>

                                        <td className="p-4 text-center">
                                            {niveau.code}
                                        </td>

                                        <td className="p-4 text-center">
                                            {niveau.ordre}
                                        </td>

                                        <td className="p-4">

                                            <div className="flex justify-center gap-2">

                                                <Link
                                                    href={route("niveaux.edit", niveau.id)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                                >
                                                    Modifier
                                                </Link>

                                                <button
                                                    onClick={() => supprimer(niveau.id)}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
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