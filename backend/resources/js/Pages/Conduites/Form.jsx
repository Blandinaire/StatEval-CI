import { Link } from "@inertiajs/react";

export default function Form({
    data,
    setData,
    eleves,
    educateurs,
    anneesScolaires,
    classes,
    evaluations,
    errors,
    processing,
    submit,
    submitLabel = "Enregistrer",
}) {
    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Informations principales */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Informations sur la conduite
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    {/* Élève */}
                    <div>
                        <label className="mb-2 block font-semibold">
                            Élève
                        </label>

                        <select
                            value={data.eleve_id}
                            onChange={(e) =>
                                setData("eleve_id", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner un élève...</option>

                            {eleves.map((eleve) => (
                                <option
                                    key={eleve.id}
                                    value={eleve.id}
                                >
                                    {eleve.nom} {eleve.prenoms}
                                </option>
                            ))}
                        </select>

                        {errors.eleve_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.eleve_id}
                            </p>
                        )}
                    </div>

                    {/* Éducateur */}
                    <div>
                        <label className="mb-2 block font-semibold">
                            Éducateur
                        </label>

                        <select
                            value={data.educateur_id}
                            onChange={(e) =>
                                setData(
                                    "educateur_id",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">
                                Sélectionner un éducateur...
                            </option>

                            {educateurs.map((educateur) => (
                                <option
                                    key={educateur.id}
                                    value={educateur.id}
                                >
                                    {educateur.nom}{" "}
                                    {educateur.prenoms}
                                </option>
                            ))}
                        </select>

                        {errors.educateur_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.educateur_id}
                            </p>
                        )}
                    </div>

                    {/* Année scolaire */}
                    <div>
                        <label className="mb-2 block font-semibold">
                            Année scolaire
                        </label>

                        <select
                            value={data.annee_scolaire_id}
                            onChange={(e) =>
                                setData(
                                    "annee_scolaire_id",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">
                                Sélectionner une année...
                            </option>

                            {anneesScolaires.map((annee) => (
                                <option
                                    key={annee.id}
                                    value={annee.id}
                                >
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

                    {/* Classe */}
                    <div>
                        <label className="mb-2 block font-semibold">
                            Classe
                        </label>

                        <select
                            value={data.classe_id}
                            onChange={(e) =>
                                setData("classe_id", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">
                                Sélectionner une classe...
                            </option>

                            {classes.map((classe) => (
                                <option
                                    key={classe.id}
                                    value={classe.id}
                                >
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

                    {/* Évaluation */}
                    <div>
                        <label className="mb-2 block font-semibold">
                            Évaluation
                        </label>

                        <select
                            value={data.evaluation_id}
                            onChange={(e) =>
                                setData(
                                    "evaluation_id",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">
                                Sélectionner une évaluation...
                            </option>

                            {evaluations.map((evaluation) => (
                                <option
                                    key={evaluation.id}
                                    value={evaluation.id}
                                >
                                    {evaluation.libelle ??
                                        `Évaluation #${evaluation.id}`}
                                </option>
                            ))}
                        </select>

                        {errors.evaluation_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.evaluation_id}
                            </p>
                        )}
                    </div>

                    {/* Note */}
                    <div>
                        <label className="mb-2 block font-semibold">
                            Note de conduite /20
                        </label>

                        <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.01"
                            value={data.note}
                            onChange={(e) =>
                                setData("note", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                            placeholder="Exemple : 18"
                        />

                        {errors.note && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.note}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Observation */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Observation
                    </h2>
                </div>

                <div className="p-6">
                    <label className="mb-2 block font-semibold">
                        Observation éventuelle
                    </label>

                    <textarea
                        rows="5"
                        value={data.observation}
                        onChange={(e) =>
                            setData("observation", e.target.value)
                        }
                        className="w-full rounded-lg border p-3"
                        placeholder="Exemple : Très bonne conduite et respect du règlement intérieur."
                    />

                    {errors.observation && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.observation}
                        </p>
                    )}
                </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4">
                <Link
                    href={route("conduites.index")}
                    className="rounded-lg border px-6 py-3"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {processing ? "Enregistrement..." : submitLabel}
                </button>
            </div>
        </form>
    );
}