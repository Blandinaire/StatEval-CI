import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { Plus } from "lucide-react";

export default function Index({ maquettes }) {
    return (
        <AdminLayout>

            <Head title="Maquettes" />

            <div className="space-y-6">

                <div className="flex items-center justify-between">

                    <div>

                        <h1 className="text-3xl font-bold">
                            Maquettes pédagogiques
                        </h1>

                        <p className="text-gray-500">
                            Gestion des maquettes pédagogiques
                        </p>

                    </div>

                    <Link
                        href={route("maquettes.create")}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        <Plus size={18} />

                        Nouvelle maquette
                    </Link>

                </div>

                <div className="rounded-xl bg-white shadow p-6">

                    <table className="min-w-full">

                        <thead>

                            <tr className="border-b">

                                <th className="py-3 text-left">
                                    Année
                                </th>

                                <th className="py-3 text-left">
                                    Cycle
                                </th>

                                <th className="py-3 text-left">
                                    Niveau
                                </th>

                                <th className="py-3 text-left">
                                    Série
                                </th>

                                <th className="py-3 text-left">
                                    Version
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {maquettes.data.map((maquette) => (

                                <tr
                                    key={maquette.id}
                                    className="border-b hover:bg-gray-50"
                                >

                                    <td className="py-3">
                                        {maquette.annee_scolaire.libelle}
                                    </td>

                                    <td className="py-3">
                                        {maquette.cycle.libelle}
                                    </td>

                                    <td className="py-3">
                                        {maquette.niveau.libelle}
                                    </td>

                                    <td className="py-3">
                                        {maquette.serie
                                            ? maquette.serie.libelle
                                            : "-"}
                                    </td>

                                    <td className="py-3">
                                        {maquette.version}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </AdminLayout>
    );
}