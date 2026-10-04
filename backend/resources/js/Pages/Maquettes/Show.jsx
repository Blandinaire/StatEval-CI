import AdminLayout from "@/Layouts/AdminLayout";
import {
    Head,
    Link,
    router,
    useForm,
    usePage,
} from "@inertiajs/react";

import {
    ArrowLeft,
    BookOpen,
    Plus,
    Pencil,
    CheckCircle,
    XCircle,
    Clock,
    Hash,
    Copy,
    Power,
    Trash2,
} from "lucide-react";

import { useState } from "react";

export default function Show({
    maquette,
    versions = [],
}) {
    const { auth } = usePage().props;

    const user = auth?.user;

    const role =
        user?.roles?.[0]?.name ??
        user?.role ??
        "Utilisateur";

    const isSuperAdmin =
        role === "SuperAdmin";

    const lignes =
        maquette?.lignes ?? [];

    const [nouvelleVersionOuverte, setNouvelleVersionOuverte] =
        useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        nom_version: "",
        description: "",
        active: true,
    });

    const totalCoefficient =
        lignes.reduce(
            (total, ligne) =>
                total +
                Number(
                    ligne.coefficient || 0,
                ),
            0,
        );

    const totalVolumeHoraire =
        lignes.reduce(
            (total, ligne) =>
                total +
                Number(
                    ligne.volume_horaire || 0,
                ),
            0,
        );

    function ouvrirNouvelleVersion() {
        reset();
        setData(
            "nom_version",
            `Variante V${
                Number(maquette.version || 1) +
                1
            }`,
        );
        setNouvelleVersionOuverte(true);
    }

    function creerVersion(e) {
        e.preventDefault();

        post(
            route(
                "maquettes.versions.store",
                maquette.id,
            ),
        );
    }

    function basculerActive(version) {
        router.patch(
            route(
                "maquettes.toggle-active",
                version.id,
            ),
            {},
            {
                preserveScroll: true,
            },
        );
    }

    function supprimerVersion(version) {
        if (
            Number(version.classes_count || 0) >
            0
        ) {
            window.alert(
                `Cette version est utilisée par ${version.classes_count} classe(s). Elle ne peut pas être supprimée.`,
            );
            return;
        }

        if (
            !window.confirm(
                `Voulez-vous vraiment supprimer V${version.version} — ${version.nom_version} ?\n\nCette opération est irréversible.`,
            )
        ) {
            return;
        }

        router.delete(
            route(
                "maquettes.destroy",
                version.id,
            ),
        );
    }

    return (
        <AdminLayout>
            <Head
                title={`${maquette.libelle} - Maquette pédagogique`}
            />

            <div className="space-y-6">
                {/* =====================================================
                    EN-TÊTE
                ====================================================== */}

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <Link
                            href={route(
                                "maquettes.index",
                            )}
                            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            <ArrowLeft size={18} />
                            Retour aux maquettes
                        </Link>

                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {maquette.libelle}
                            </h1>

                            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                                V{maquette.version}
                            </span>

                            {maquette.active ? (
                                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                                    Active
                                </span>
                            ) : (
                                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                                    Inactive
                                </span>
                            )}
                        </div>

                        <p className="mt-2 text-gray-500">
                            {maquette.nom_version ??
                                "Standard"}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {isSuperAdmin && (
                            <>
                                <button
                                    type="button"
                                    onClick={
                                        ouvrirNouvelleVersion
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    <Copy size={18} />
                                    Nouvelle version
                                </button>

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
                            </>
                        )}
                    </div>
                </div>

                {/* =====================================================
                    FORMULAIRE NOUVELLE VERSION
                ====================================================== */}

                {nouvelleVersionOuverte &&
                    isSuperAdmin && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-indigo-900">
                                    Créer une nouvelle version
                                </h2>

                                <p className="mt-1 text-sm text-indigo-700">
                                    Les matières de V
                                    {maquette.version}{" "}
                                    seront copiées automatiquement.
                                </p>
                            </div>

                            <form
                                onSubmit={creerVersion}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                                        Nom de la version
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            data.nom_version
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "nom_version",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        placeholder="Ex : Anglais renforcé"
                                    />

                                    {errors.nom_version && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                errors.nom_version
                                            }
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                                        Description
                                    </label>

                                    <textarea
                                        rows="4"
                                        value={
                                            data.description
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        placeholder="Décrivez les modifications ou particularités de cette version..."
                                    />

                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                errors.description
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        id="nouvelle-version-active"
                                        type="checkbox"
                                        checked={Boolean(
                                            data.active,
                                        )}
                                        onChange={(e) =>
                                            setData(
                                                "active",
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                    />

                                    <label
                                        htmlFor="nouvelle-version-active"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Activer immédiatement cette version
                                    </label>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="submit"
                                        disabled={
                                            processing
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        <Copy size={17} />

                                        {processing
                                            ? "Création..."
                                            : "Créer la version"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setNouvelleVersionOuverte(
                                                false,
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                {/* =====================================================
                    DESCRIPTION
                ====================================================== */}

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">
                        Description de la version
                    </h2>

                    <p className="whitespace-pre-line text-gray-600">
                        {maquette.description ||
                            "Aucune description renseignée."}
                    </p>
                </div>

                {/* =====================================================
                    INFORMATIONS GÉNÉRALES
                ====================================================== */}

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
                                {maquette.annee_scolaire?.libelle ??
                                    "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Cycle
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {maquette.cycle?.libelle ??
                                    "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Niveau
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {maquette.niveau?.libelle ??
                                    "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Série
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {maquette.serie?.libelle ??
                                    "Aucune"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Version
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                V{maquette.version}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Variante
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {maquette.nom_version ??
                                    "Standard"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    STATISTIQUES
                ====================================================== */}

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
                                    {totalCoefficient.toFixed(
                                        2,
                                    )}
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
                                    {totalVolumeHoraire.toFixed(
                                        2,
                                    )}{" "}
                                    h
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    HISTORIQUE DES VERSIONS
                ====================================================== */}

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="border-b px-6 py-5">
                        <h2 className="text-xl font-bold text-gray-900">
                            Versions de cette maquette
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Plusieurs versions peuvent être actives
                            simultanément.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                        Version
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                        Variante
                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                        Statut
                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                        Matières
                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                        Classes
                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {versions.map(
                                    (version) => (
                                        <tr
                                            key={
                                                version.id
                                            }
                                            className={`border-t ${
                                                Number(
                                                    version.id,
                                                ) ===
                                                Number(
                                                    maquette.id,
                                                )
                                                    ? "bg-blue-50/50"
                                                    : ""
                                            }`}
                                        >
                                            <td className="px-4 py-4">
                                                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                                    V
                                                    {
                                                        version.version
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-gray-900">
                                                    {
                                                        version.nom_version
                                                    }
                                                </p>

                                                {version.description && (
                                                    <p className="mt-1 max-w-md truncate text-xs text-gray-500">
                                                        {
                                                            version.description
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                {version.active ? (
                                                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                {
                                                    version.lignes_count
                                                }
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                {
                                                    version.classes_count
                                                }
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link
                                                        href={route(
                                                            "maquettes.show",
                                                            version.id,
                                                        )}
                                                        title="Voir cette version"
                                                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <EyeIcon />
                                                    </Link>

                                                    {isSuperAdmin && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                basculerActive(
                                                                    version,
                                                                )
                                                            }
                                                            title={
                                                                version.active
                                                                    ? "Désactiver"
                                                                    : "Activer"
                                                            }
                                                            className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                                                        >
                                                            <Power
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </button>
                                                    )}

                                                    {isSuperAdmin && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                supprimerVersion(
                                                                    version,
                                                                )
                                                            }
                                                            title="Supprimer"
                                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* =====================================================
                    MATIÈRES
                ====================================================== */}

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Matières de la maquette
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Liste des matières configurées pour cette version.
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
                                                Cette version ne contient
                                                encore aucune matière.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    lignes.map(
                                        (ligne) => (
                                            <tr
                                                key={
                                                    ligne.id
                                                }
                                                className="border-t transition hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4">
                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                                                        {
                                                            ligne.ordre
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="font-semibold text-gray-900">
                                                        {
                                                            ligne
                                                                .matiere
                                                                ?.libelle
                                                        }
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4 text-center font-medium">
                                                    {
                                                        ligne.coefficient
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-center">
                                                    {
                                                        ligne.volume_horaire
                                                    }{" "}
                                                    h
                                                </td>

                                                <td className="px-4 py-4 text-center">
                                                    {
                                                        ligne.note_sur
                                                    }
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
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                            Oui
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-red-500">
                                                            <XCircle
                                                                size={
                                                                    18
                                                                }
                                                            />
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
                                                            className="inline-flex rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                                                            title="Modifier cette matière"
                                                        >
                                                            <Pencil
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </Link>
                                                    </td>
                                                )}
                                            </tr>
                                        ),
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function EyeIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}