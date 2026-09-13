import { Link } from "@inertiajs/react";

export default function Form({
    data,
    setData,

    etablissements,
    anneesScolaires,
    classes,
    eleves,
    educateurs,

    isSuperAdmin,

    chargementClasses,
    chargementEleves,

    changerEtablissement,
    changerAnneeScolaire,
    changerClasse,

    modifierNote,

    errors,
    processing,
    submit,
}) {
    return (
        <form onSubmit={submit} className="space-y-8">
            {/* ========================================================= */}
            {/* PARAMÈTRES DE LA SAISIE */}
            {/* ========================================================= */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Paramètres de la saisie
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* ================================================= */}
                    {/* ÉTABLISSEMENT */}
                    {/* ================================================= */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Établissement
                        </label>

                        <select
                            value={data.etablissement_id}
                            onChange={(e) =>
                                changerEtablissement(e.target.value)
                            }
                            disabled={!isSuperAdmin}
                            className="w-full rounded-lg border p-3 disabled:bg-gray-100"
                        >
                            <option value="">Sélectionner...</option>

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
                            <p className="mt-1 text-sm text-red-600">
                                {errors.etablissement_id}
                            </p>
                        )}

                        {!isSuperAdmin && (
                            <p className="mt-1 text-xs text-gray-500">
                                Établissement automatiquement défini selon votre
                                profil.
                            </p>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* ANNÉE SCOLAIRE */}
                    {/* ================================================= */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Année scolaire
                        </label>

                        <select
                            value={data.annee_scolaire_id}
                            onChange={(e) =>
                                changerAnneeScolaire(e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner...</option>

                            {anneesScolaires.map((annee) => (
                                <option key={annee.id} value={annee.id}>
                                    {annee.libelle}
                                </option>
                            ))}
                        </select>

                        {errors.annee_scolaire_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.annee_scolaire_id}
                            </p>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* CLASSE */}
                    {/* ================================================= */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Classe
                        </label>

                        <select
                            value={data.classe_id}
                            onChange={(e) => changerClasse(e.target.value)}
                            disabled={
                                chargementClasses || !data.annee_scolaire_id
                            }
                            className="w-full rounded-lg border p-3 disabled:bg-gray-100"
                        >
                            <option value="">
                                {chargementClasses
                                    ? "Chargement des classes..."
                                    : "Sélectionner..."}
                            </option>

                            {classes.map((classe) => (
                                <option key={classe.id} value={classe.id}>
                                    {classe.libelle}
                                </option>
                            ))}
                        </select>

                        {errors.classe_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.classe_id}
                            </p>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* PÉRIODE */}
                    {/* ================================================= */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Période
                        </label>

                        <select
                            value={data.periode}
                            onChange={(e) => setData("periode", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner...</option>

                            <option value="Trimestre 1">Trimestre 1</option>

                            <option value="Trimestre 2">Trimestre 2</option>

                            <option value="Trimestre 3">Trimestre 3</option>

                            <option value="Semestre 1">Semestre 1</option>

                            <option value="Semestre 2">Semestre 2</option>
                        </select>

                        {errors.periode && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.periode}
                            </p>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* ÉDUCATEUR */}
                    {/* ================================================= */}

                    <div className="md:col-span-2">
                        <label className="mb-2 block font-semibold">
                            Éducateur responsable
                        </label>

                        <select
                            value={data.educateur_id}
                            onChange={(e) =>
                                setData("educateur_id", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">
                                Sélectionner un éducateur...
                            </option>

                            {educateurs.map((educateur) => (
                                <option key={educateur.id} value={educateur.id}>
                                    {educateur.nom} {educateur.prenoms}
                                </option>
                            ))}
                        </select>

                        {errors.educateur_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.educateur_id}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* LISTE DES ÉLÈVES */}
            {/* ========================================================= */}

            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold">
                            Notes de conduite des élèves
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Saisissez directement la note de chaque élève.
                        </p>
                    </div>

                    {eleves.length > 0 && (
                        <div className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                            {eleves.length} élève
                            {eleves.length > 1 ? "s" : ""}
                        </div>
                    )}
                </div>

                {chargementEleves ? (
                    <div className="p-12 text-center text-gray-500">
                        Chargement des élèves...
                    </div>
                ) : eleves.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        Sélectionnez une classe pour afficher la liste des
                        élèves.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-4 text-left">N°</th>

                                    <th className="p-4 text-left">Matricule</th>

                                    <th className="p-4 text-left">
                                        Nom et prénoms
                                    </th>

                                    <th className="w-40 p-4 text-center">
                                        Note /20
                                    </th>

                                    <th className="p-4 text-left">
                                        Observation
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {eleves.map((eleve, index) => (
                                    <tr
                                        key={eleve.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        {/* NUMÉRO */}

                                        <td className="p-4 font-semibold">
                                            {index + 1}
                                        </td>

                                        {/* MATRICULE */}

                                        <td className="p-4 text-gray-600">
                                            {eleve.matricule}
                                        </td>

                                        {/* NOM */}

                                        <td className="p-4 font-semibold">
                                            {eleve.nom} {eleve.prenoms}
                                        </td>

                                        {/* NOTE */}

                                        <td className="p-4">
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.01"
                                                value={
                                                    data.notes[index]?.note ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    modifierNote(
                                                        index,
                                                        "note",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border p-2 text-center font-semibold"
                                                placeholder="--"
                                            />

                                            {errors[`notes.${index}.note`] && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {
                                                        errors[
                                                            `notes.${index}.note`
                                                        ]
                                                    }
                                                </p>
                                            )}
                                        </td>

                                        {/* OBSERVATION */}

                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={
                                                    data.notes[index]
                                                        ?.observation ?? ""
                                                }
                                                readOnly
                                                className="w-full rounded-lg border bg-gray-50 p-2 text-gray-700"
                                                placeholder="Générée automatiquement selon la note"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ========================================================= */}
            {/* BOUTONS */}
            {/* ========================================================= */}

            <div className="flex items-center justify-end gap-4">
                <Link
                    href={route("conduites.index")}
                    className="rounded-lg border px-6 py-3"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={
                        processing ||
                        eleves.length === 0 ||
                        !data.periode ||
                        !data.classe_id
                    }
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing ? "Enregistrement..." : "Enregistrer les notes"}
                </button>
            </div>
        </form>
    );
}
