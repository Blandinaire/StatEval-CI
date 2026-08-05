import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ etablissements }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Gestion des établissements
                </h2>
            }
        >
            <Head title="Établissements" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6">

                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold">
                            Gestion des établissements
                        </h1>

                        <Link
                               href={route('etablissements.create')}
                               className="rounded-lg border-2 border-red-600 bg-red-600 px-4 py-2 font-bold text-white"
                                >
                                  + Nouvel établissement
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-4 text-left">Nom</th>
                                    <th className="p-4 text-left">Ville</th>
                                    <th className="p-4 text-left">Téléphone</th>
                                </tr>
                            </thead>

                            <tbody>
                                {etablissements.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="p-8 text-center text-gray-500"
                                        >
                                            Aucun établissement enregistré.
                                        </td>
                                    </tr>
                                ) : (
                                    etablissements.map((etablissement) => (
                                        <tr
                                            key={etablissement.id}
                                            className="border-t"
                                        >
                                            <td className="p-4">
                                                {etablissement.nom}
                                            </td>
                                            <td className="p-4">
                                                {etablissement.ville}
                                            </td>
                                            <td className="p-4">
                                                {etablissement.telephone}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}