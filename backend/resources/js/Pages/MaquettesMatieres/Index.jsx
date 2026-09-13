import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    Pencil,
    Trash2,
    Plus,
} from "lucide-react";
import ResponsiveTable from "@/Components/ResponsiveTable";

export default function Index({ maquette, lignes }) {
    const totalCoefficient = lignes.reduce(
        (total, ligne) => total + Number(ligne.coefficient || 0),
        0,
    );

    const totalVolumeHoraire = lignes.reduce(
        (total, ligne) => total + Number(ligne.volume_horaire || 0),
        0,
    );
    function monter(ligne) {
        router.post(
            route("maquettes.matieres.monter", [maquette.id, ligne.id]),
        );
    }

    function descendre(ligne) {
        router.post(
            route("maquettes.matieres.descendre", [maquette.id, ligne.id]),
        );
    }

    function supprimer(ligne) {
        const confirmation = window.confirm(
            `Voulez-vous vraiment supprimer la matière "${ligne.matiere.libelle}" de cette maquette ?`,
        );

        if (!confirmation) {
            return;
        }

        router.delete(
            route("maquettes.matieres.destroy", [maquette.id, ligne.id]),
        );
    }

    return (
        <AdminLayout>
            <Head title={`${maquette.libelle} - Matières`} />

            <div className="space-y-6">
                {/* En-tête */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {maquette.libelle}
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Gestion et organisation des matières de la maquette
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={route("maquettes.index")}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            <ArrowLeft size={18} />
                            Retour
                        </Link>

                        <Link
                            href={route(
                                "maquettes.matieres.create",
                                maquette.id,
                            )}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                        >
                            <Plus size={20} />
                            Ajouter une matière
                        </Link>
                    </div>
                </div>

                {/* Informations sur la maquette */}
                <div className="grid grid-cols-1 gap-4 rounded-xl border bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="text-sm text-gray-500">Niveau</p>

                        <p className="font-semibold text-gray-900">
                            {maquette.niveau?.libelle ?? "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Cycle</p>

                        <p className="font-semibold text-gray-900">
                            {maquette.cycle?.libelle ?? "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Série</p>

                        <p className="font-semibold text-gray-900">
                            {maquette.serie?.libelle ?? "Aucune"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Nombre de matières
                        </p>

                        <p className="font-semibold text-gray-900">
                            {lignes.length}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Total des coefficients
                        </p>

                        <p className="font-semibold text-blue-700">
                            {totalCoefficient.toFixed(2)}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Total du volume horaire
                        </p>

                        <p className="font-semibold text-blue-700">
                            {totalVolumeHoraire.toFixed(2)} h
                        </p>
                    </div>
                </div>

                {/* Tableau */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Matières de la maquette
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Utilisez les flèches pour modifier l'ordre des
                            matières.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow">
                        <ResponsiveTable minWidth="700px">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                        Ordre
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                        Matière
                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                        Coefficient
                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                        Volume horaire
                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                        Note sur
                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                        Statut
                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {lignes.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <p className="text-lg font-medium">
                                                Aucune matière ajoutée
                                            </p>

                                            <p className="mt-1 text-sm">
                                                Commencez par ajouter les
                                                matières de cette maquette
                                                pédagogique.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    lignes.map((ligne, index) => (
                                        <tr
                                            key={ligne.id}
                                            className="border-t transition hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4">
                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700">
                                                    {ligne.ordre}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 font-medium text-gray-900">
                                                {ligne.matiere?.libelle ?? "-"}
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                {ligne.coefficient}
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                {ligne.volume_horaire} h
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                {ligne.note_sur}
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                {ligne.obligatoire ? (
                                                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                        Obligatoire
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                                        Optionnelle
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Monter */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            monter(ligne)
                                                        }
                                                        disabled={index === 0}
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"
                                                        title="Monter"
                                                    >
                                                        <ArrowUp size={18} />
                                                    </button>

                                                    {/* Descendre */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            descendre(ligne)
                                                        }
                                                        disabled={
                                                            index ===
                                                            lignes.length - 1
                                                        }
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"
                                                        title="Descendre"
                                                    >
                                                        <ArrowDown size={18} />
                                                    </button>

                                                    {/* Modifier */}
                                                    <Link
                                                        href={route(
                                                            "maquettes.matieres.edit",
                                                            [
                                                                maquette.id,
                                                                ligne.id,
                                                            ],
                                                        )}
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                        title="Modifier"
                                                    >
                                                        <Pencil size={18} />
                                                    </Link>

                                                    {/* Supprimer */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            supprimer(ligne)
                                                        }
                                                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={18} />
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
            </div>
        </AdminLayout>
    );
}
