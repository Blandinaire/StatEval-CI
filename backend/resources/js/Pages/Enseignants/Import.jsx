import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Import() {
    const { etablissements = [], flash = {} } = usePage().props;

    const [fichier, setFichier] = useState(null);

    const { data, setData, post, processing, errors, progress } = useForm({
        etablissement_id: "",
        fichier: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0] || null;

        setFichier(file);
        setData("fichier", file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("enseignants.import"), {
            forceFormData: true,
        });
    };

    const formatSize = (bytes) => {
        if (!bytes) return "0 Ko";

        return `${(bytes / 1024).toFixed(1)} Ko`;
    };

    return (
        <AdminLayout>
            <Head title="Importer des enseignants" />

            <div className="mx-auto max-w-5xl space-y-6">
                {flash.import_error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                        <div className="font-semibold">
                            Échec de l'importation
                        </div>

                        <div className="mt-1 text-sm">{flash.import_error}</div>
                    </div>
                )}

                {/* EN-TÊTE */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Importer des enseignants
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Importation massive des enseignants depuis un
                            fichier Excel ou CSV.
                        </p>
                    </div>

                    <Link
                        href={route("enseignants.index")}
                        className="rounded-lg border px-5 py-3 text-gray-700 hover:bg-gray-50"
                    >
                        ← Retour à la liste
                    </Link>
                </div>

                {/* INFORMATIONS */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <h2 className="font-bold text-blue-900">
                        Informations importantes
                    </h2>

                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-blue-800">
                        <li>
                            L'établissement sélectionné sera automatiquement
                            attribué à tous les enseignants importés.
                        </li>

                        <li>
                            Les champs obligatoires sont :
                            <strong> Nom, Prénoms et Sexe.</strong>
                        </li>

                        <li>
                            Le matricule interne est généré automatiquement par
                            SchoolManager.
                        </li>

                        <li>
                            Les autres informations peuvent être laissées vides.
                        </li>
                    </ul>
                </div>
                {/* MESSAGE DE SUCCÈS */}
                {flash.success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">✅</div>

                            <div>
                                <p className="font-bold">Importation réussie</p>

                                <p className="mt-1 text-sm">{flash.success}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* MESSAGE D'ERREUR D'IMPORTATION */}
                {flash.import_error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">❌</div>

                            <div>
                                <p className="font-bold">
                                    Importation impossible
                                </p>

                                <p className="mt-1 whitespace-pre-line text-sm">
                                    {flash.import_error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* FORMULAIRE */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ÉTABLISSEMENT */}
                    <div className="rounded-xl border bg-white shadow-sm">
                        <div className="border-b bg-slate-50 px-6 py-4">
                            <h2 className="text-xl font-bold">
                                1. Établissement
                            </h2>
                        </div>

                        <div className="p-6">
                            <label className="mb-2 block font-semibold">
                                Établissement
                                <span className="text-red-600"> *</span>
                            </label>

                            <select
                                value={data.etablissement_id}
                                onChange={(e) =>
                                    setData("etablissement_id", e.target.value)
                                }
                                className="w-full rounded-lg border p-3"
                            >
                                <option value="">
                                    Sélectionner un établissement...
                                </option>

                                {etablissements.map((etablissement) => (
                                    <option
                                        key={etablissement.id}
                                        value={etablissement.id}
                                    >
                                        {etablissement.nom}
                                    </option>
                                ))}
                            </select>

                            {errors.etablissement_id && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.etablissement_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* MODÈLE */}
                    <div className="rounded-xl border bg-white shadow-sm">
                        <div className="border-b bg-slate-50 px-6 py-4">
                            <h2 className="text-xl font-bold">
                                2. Modèle Excel
                            </h2>
                        </div>

                        <div className="p-6">
                            <p className="mb-4 text-gray-600">
                                Utilisez de préférence le modèle officiel afin
                                d'éviter les erreurs de format.
                            </p>

                            <a
                                href={
                                    data.etablissement_id
                                        ? route("enseignants.import.template", {
                                              etablissement_id:
                                                  data.etablissement_id,
                                          })
                                        : "#"
                                }
                                onClick={(e) => {
                                    if (!data.etablissement_id) {
                                        e.preventDefault();
                                        alert(
                                            "Veuillez sélectionner un établissement avant de télécharger le modèle.",
                                        );
                                    }
                                }}
                                className="inline-flex items-center rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                            >
                                ↓ Télécharger le modèle Excel
                            </a>
                        </div>
                    </div>

                    {/* FICHIER */}
                    <div className="rounded-xl border bg-white shadow-sm">
                        <div className="border-b bg-slate-50 px-6 py-4">
                            <h2 className="text-xl font-bold">
                                3. Fichier à importer
                            </h2>
                        </div>

                        <div className="p-6">
                            <label
                                htmlFor="fichier"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-10 text-center hover:border-blue-400 hover:bg-blue-50"
                            >
                                <div className="text-5xl">📊</div>

                                <div className="mt-4 font-semibold text-gray-700">
                                    Cliquez pour sélectionner votre fichier
                                </div>

                                <div className="mt-1 text-sm text-gray-500">
                                    Excel (.xlsx, .xls) ou CSV
                                </div>

                                <input
                                    id="fichier"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            {fichier && (
                                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {fichier.name}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {formatSize(fichier.size)}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFichier(null);
                                                setData("fichier", null);
                                            }}
                                            className="text-sm font-semibold text-red-600 hover:text-red-800"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            )}

                            {errors.fichier && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.fichier}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* PROGRESSION */}
                    {progress && (
                        <div className="rounded-lg border bg-white p-4">
                            <div className="mb-2 flex justify-between text-sm">
                                <span>Importation...</span>
                                <span>{progress.percentage}%</span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full bg-blue-600 transition-all"
                                    style={{
                                        width: `${progress.percentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-4">
                        <Link
                            href={route("enseignants.index")}
                            className="rounded-lg border px-6 py-3"
                        >
                            Annuler
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                processing ||
                                !data.etablissement_id ||
                                !data.fichier
                            }
                            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? "Importation en cours..."
                                : "Importer les enseignants"}
                        </button>
                    </div>
                </form>

                {Object.keys(errors).length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                        <div className="font-semibold">
                            L'importation n'a pas pu être effectuée.
                        </div>

                        <ul className="mt-2 list-disc pl-5 text-sm">
                            {Object.entries(errors).map(([field, message]) => (
                                <li key={field}>{message}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
