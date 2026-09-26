import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    BookOpen,
    Plus,
    Pencil,
    CheckCircle,
    XCircle,
    Clock,
    Hash,
} from "lucide-react";

export default function Show({ maquette }) {
    const { auth } = usePage().props;

    const user = auth?.user;

    const role = user?.roles?.[0]?.name ?? user?.role ?? "Utilisateur";

    const isSuperAdmin = role === "SuperAdmin";
    /*
    |--------------------------------------------------------------------------
    | MATIÈRES DE LA MAQUETTE
    |--------------------------------------------------------------------------
    */

    const lignes = maquette?.lignes ?? [];

    const totalCoefficient = lignes.reduce(
        (total, ligne) => total + Number(ligne.coefficient || 0),
        0,
    );

    const totalVolumeHoraire = lignes.reduce(
        (total, ligne) => total + Number(ligne.volume_horaire || 0),
        0,
    );

    return (
        <AdminLayout>
            <Head title={`${maquette.libelle} - Maquette pédagogique`} />

            <div className="space-y-6">
                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <Link
                            href={route("maquettes.index")}
                            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            <ArrowLeft size={18} />
                            Retour aux maquettes
                        </Link>

                        <h1 className="text-3xl font-bold text-gray-900">
                            {maquette.libelle}
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Détail de la maquette pédagogique
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {isSuperAdmin && (
                            <Link
                                href={route(
                                    "maquettes.matieres.index",
                                    maquette.id,
                                )}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <BookOpen size={18} />
                                Gérer les matières
                            </Link>
                        )}

                        {isSuperAdmin && (
                            <Link
                                href={route(
                                    "maquettes.matieres.create",
                                    maquette.id,
                                )}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Plus size={18} />
                                Ajouter une matière
                            </Link>
                        )}
                    </div>
                </div>

                {/* =====================================================
                    INFORMATIONS GÉNÉRALES
                ===================================================== */}

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-bold text-gray-900">
                        Informations générales
                    </h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-sm text-gray-500">
                                Année scolaire
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {maquette.annee_scolaire?.libelle ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Cycle</p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {maquette.cycle?.libelle ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Niveau</p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {maquette.niveau?.libelle ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Série</p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {maquette.serie?.libelle ?? "Aucune"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Version</p>

                            <p className="mt-1">
                                <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                                    Version {maquette.version}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    STATISTIQUES DES MATIÈRES
                ===================================================== */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                                <BookOpen size={24} />
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Nombre de matières
                                </p>

                                <p className="text-2xl font-bold text-gray-900">
                                    {lignes.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-green-100 p-3 text-green-600">
                                <Hash size={24} />
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Total des coefficients
                                </p>

                                <p className="text-2xl font-bold text-gray-900">
                                    {totalCoefficient.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                                <Clock size={24} />
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Volume horaire total
                                </p>

                                <p className="text-2xl font-bold text-gray-900">
                                    {totalVolumeHoraire.toFixed(2)} h
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    MATIÈRES DE LA MAQUETTE
                ===================================================== */}

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Matières de la maquette
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Liste des matières configurées pour cette
                                maquette pédagogique.
                            </p>
                        </div>

                        {isSuperAdmin && (
                            <Link
                                href={route(
                                    "maquettes.matieres.create",
                                    maquette.id,
                                )}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Plus size={18} />
                                Ajouter une matière
                            </Link>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
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
                                        Moyenne
                                    </th>

                                    {isSuperAdmin && (
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {lignes.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-6 py-12 text-center"
                                        >
                                            <BookOpen
                                                size={40}
                                                className="mx-auto mb-3 text-gray-300"
                                            />

                                            <p className="text-lg font-semibold text-gray-700">
                                                Aucune matière ajoutée
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Cette maquette pédagogique ne
                                                contient encore aucune matière.
                                            </p>

                                            <Link
                                                href={route(
                                                    "maquettes.matieres.create",
                                                    maquette.id,
                                                )}
                                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                            >
                                                <Plus size={18} />
                                                Ajouter la première matière
                                            </Link>
                                        </td>
                                    </tr>
                                ) : (
                                    lignes.map((ligne) => (
                                        <tr
                                            key={ligne.id}
                                            className="border-t transition hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4">
                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                                                    {ligne.ordre}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-gray-900">
                                                    {ligne.matiere?.libelle ??
                                                        "-"}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 text-center font-medium text-gray-900">
                                                {ligne.coefficient}
                                            </td>

                                            <td className="px-4 py-4 text-center text-gray-700">
                                                {ligne.volume_horaire} h
                                            </td>

                                            <td className="px-4 py-4 text-center text-gray-700">
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

                                            <td className="px-4 py-4 text-center">
                                                {ligne.prise_en_compte_moyenne ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600">
                                                        <CheckCircle
                                                            size={18}
                                                        />
                                                        Oui
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-500">
                                                        <XCircle size={18} />
                                                        Non
                                                    </span>
                                                )}
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="px-4 py-4 text-center">
                                                    <Link
                                                        href={route(
                                                            "maquettes.matieres.edit",
                                                            [
                                                                maquette.id,
                                                                ligne.id,
                                                            ],
                                                        )}
                                                        className="inline-flex rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                        title="Modifier cette matière"
                                                    >
                                                        <Pencil size={18} />
                                                    </Link>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
