import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, usePage } from "@inertiajs/react";

export default function Import({ etablissements, annees }) {
    const { flash } = usePage().props;

    const import_errors = flash?.import_errors ?? [];
    
    const { data, setData, post, processing, errors, progress } = useForm({
        etablissement_id: "",
        annee_scolaire_id: "",
        fichier: null,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("eleves.import"), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const telechargerModele = () => {
        if (!data.etablissement_id || !data.annee_scolaire_id) {
            return;
        }

        window.location.href = route("eleves.import.template", {
            etablissement_id: data.etablissement_id,
            annee_scolaire_id: data.annee_scolaire_id,
        });
    };

    return (
        <AdminLayout>
            <Head title="Importer les élèves" />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* En-tête */}
                <div>
                    <h1 className="text-3xl font-bold">Importer les élèves</h1>

                    <p className="mt-1 text-gray-500">
                        Importation des élèves depuis un fichier Excel ou CSV.
                    </p>
                </div>

                {/* Informations importantes */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <h2 className="font-semibold text-blue-900">
                        Informations importantes
                    </h2>

                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-blue-800">
                        <li>
                            L'établissement et l'année scolaire sont
                            sélectionnés ici et ne doivent pas figurer dans le
                            fichier Excel.
                        </li>

                        <li>
                            La classe de chaque élève doit être inscrite
                            explicitement dans la colonne{" "}
                            <strong>classe</strong>.
                        </li>

                        <li>
                            Les champs Oui/Non doivent être renseignés à l'aide
                            des listes déroulantes du modèle Excel.
                        </li>

                        <li>
                            Le modèle Excel contient des listes déroulantes pour
                            la classe, le sexe, le régime, le statut, le statut
                            d'affectation, le type de tuteur, le groupe sanguin
                            et les champs Oui/Non.
                        </li>

                        <li>
                            Le fichier accepté peut être au format{" "}
                            <strong>.xlsx</strong>, <strong>.xls</strong> ou{" "}
                            <strong>.csv</strong>.
                        </li>

                        <li>
                            La taille maximale du fichier est de{" "}
                            <strong>10 Mo</strong>.
                        </li>
                    </ul>
                </div>
                
                {/* Rapport d'erreurs d'importation */}
                {import_errors.length > 0 && (
                    <div className="rounded-xl border border-red-300 bg-red-50 p-5">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-red-800">
                                ❌ Importation impossible
                            </h2>

                            <p className="mt-1 text-sm text-red-700">
                                {import_errors.length} erreur(s) ont été
                                détectée(s). Aucun élève n'a été importé.
                            </p>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-red-200 bg-white">
                            <table className="min-w-full text-sm">
                                <thead className="bg-red-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-red-900">
                                            Ligne
                                        </th>

                                        <th className="px-4 py-3 text-left font-semibold text-red-900">
                                            Champ
                                        </th>

                                        <th className="px-4 py-3 text-left font-semibold text-red-900">
                                            Valeur
                                        </th>

                                        <th className="px-4 py-3 text-left font-semibold text-red-900">
                                            Erreur
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-red-100">
                                    {import_errors.map((erreur, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-red-50"
                                        >
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {erreur.ligne}
                                            </td>

                                            <td className="px-4 py-3 text-gray-700">
                                                {erreur.champ}
                                            </td>

                                            <td className="px-4 py-3 text-gray-700">
                                                {erreur.valeur ?? "—"}
                                            </td>

                                            <td className="px-4 py-3 text-red-700">
                                                <ul className="list-disc space-y-1 pl-5">
                                                    {erreur.erreurs?.map(
                                                        (
                                                            message,
                                                            messageIndex,
                                                        ) => (
                                                            <li
                                                                key={
                                                                    messageIndex
                                                                }
                                                            >
                                                                {message}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Formulaire */}
                <div className="rounded-xl bg-white p-8 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Établissement */}
                        <div>
                            <label
                                htmlFor="etablissement_id"
                                className="mb-2 block font-medium text-gray-700"
                            >
                                Établissement
                            </label>

                            <select
                                id="etablissement_id"
                                value={data.etablissement_id}
                                onChange={(e) =>
                                    setData("etablissement_id", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                <option value="">
                                    Sélectionner un établissement
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

                        {/* Année scolaire */}
                        <div>
                            <label
                                htmlFor="annee_scolaire_id"
                                className="mb-2 block font-medium text-gray-700"
                            >
                                Année scolaire
                            </label>

                            <select
                                id="annee_scolaire_id"
                                value={data.annee_scolaire_id}
                                onChange={(e) =>
                                    setData("annee_scolaire_id", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                <option value="">
                                    Sélectionner une année scolaire
                                </option>

                                {annees.map((annee) => (
                                    <option key={annee.id} value={annee.id}>
                                        {annee.libelle ??
                                            `${annee.date_debut} - ${annee.date_fin}`}
                                    </option>
                                ))}
                            </select>

                            {errors.annee_scolaire_id && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.annee_scolaire_id}
                                </p>
                            )}
                        </div>

                        {/* Fichier */}
                        <div>
                            <label
                                htmlFor="fichier"
                                className="mb-2 block font-medium text-gray-700"
                            >
                                Fichier Excel / CSV
                            </label>

                            <input
                                id="fichier"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) =>
                                    setData(
                                        "fichier",
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
                            />

                            <p className="mt-2 text-sm text-gray-500">
                                Formats acceptés : XLSX, XLS ou CSV — maximum 10
                                Mo.
                            </p>

                            {errors.fichier && (
                                <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    {errors.fichier}
                                </div>
                            )}
                        </div>

                        {/* Barre de progression */}
                        {progress && (
                            <div>
                                <div className="mb-2 flex justify-between text-sm text-gray-600">
                                    <span>Importation en cours...</span>
                                    <span>{progress.percentage}%</span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-full bg-blue-600 transition-all"
                                        style={{
                                            width: `${progress.percentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Boutons */}
                        <div className="flex items-center justify-between gap-3 border-t pt-6">
                            <button
                                type="button"
                                onClick={telechargerModele}
                                disabled={
                                    !data.etablissement_id ||
                                    !data.annee_scolaire_id
                                }
                                className="rounded-lg border border-green-600 px-5 py-3 font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                📥 Télécharger le modèle Excel
                            </button>

                            <div className="flex items-center gap-3">
                                <a
                                    href={route("eleves.index")}
                                    className="rounded-lg border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-50"
                                >
                                    Annuler
                                </a>

                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !data.etablissement_id ||
                                        !data.annee_scolaire_id ||
                                        !data.fichier
                                    }
                                    className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? "Importation en cours..."
                                        : "Importer les élèves"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
