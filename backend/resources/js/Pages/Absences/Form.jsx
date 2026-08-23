import { Link } from "@inertiajs/react";

export default function Form({
    data,
    setData,
    eleves,
    educateurs,
    anneesScolaires,
    classes,
    errors,
    processing,
    submit,
    submitLabel = "Enregistrer",
}) {
    return (
        <form onSubmit={submit} className="space-y-8">

            {/* ============================================
                INFORMATIONS PRINCIPALES
            ============================================ */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Informations sur l'absence
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
                            <option value="">
                                Sélectionner un élève...
                            </option>

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
                                Aucun éducateur sélectionné
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

                </div>
            </div>


            {/* ============================================
                DATE ET DURÉE
            ============================================ */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Date et durée
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                    <div>
                        <label className="mb-2 block font-semibold">
                            Date de l'absence
                        </label>

                        <input
                            type="date"
                            value={data.date_absence}
                            onChange={(e) =>
                                setData(
                                    "date_absence",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.date_absence && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.date_absence}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Durée (heures)
                        </label>

                        <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            value={data.duree_heures}
                            onChange={(e) =>
                                setData(
                                    "duree_heures",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.duree_heures && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.duree_heures}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Heure de début
                        </label>

                        <input
                            type="time"
                            value={data.heure_debut}
                            onChange={(e) =>
                                setData(
                                    "heure_debut",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.heure_debut && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.heure_debut}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Heure de fin
                        </label>

                        <input
                            type="time"
                            value={data.heure_fin}
                            onChange={(e) =>
                                setData(
                                    "heure_fin",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.heure_fin && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.heure_fin}
                            </p>
                        )}
                    </div>

                </div>
            </div>


            {/* ============================================
                JUSTIFICATION
            ============================================ */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Justification de l'absence
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                    <div>
                        <label className="mb-2 block font-semibold">
                            Statut de justification
                        </label>

                        <select
                            value={data.justifiee ? "1" : "0"}
                            onChange={(e) =>
                                setData(
                                    "justifiee",
                                    e.target.value === "1"
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="0">
                                Non justifiée
                            </option>

                            <option value="1">
                                Justifiée
                            </option>
                        </select>

                        {errors.justifiee && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.justifiee}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Motif
                        </label>

                        <input
                            type="text"
                            value={data.motif}
                            onChange={(e) =>
                                setData("motif", e.target.value)
                            }
                            placeholder="Exemple : Maladie"
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.motif && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.motif}
                            </p>
                        )}
                    </div>

                </div>
            </div>


            {/* ============================================
                BILLET D'ABSENCE
            ============================================ */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Billet d'absence
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                    <div>
                        <label className="mb-2 block font-semibold">
                            Numéro du billet
                        </label>

                        <input
                            type="text"
                            value={data.numero_billet}
                            onChange={(e) =>
                                setData(
                                    "numero_billet",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.numero_billet && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.numero_billet}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Billet édité
                        </label>

                        <select
                            value={data.billet_edite ? "1" : "0"}
                            onChange={(e) =>
                                setData(
                                    "billet_edite",
                                    e.target.value === "1"
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="0">
                                Non
                            </option>

                            <option value="1">
                                Oui
                            </option>
                        </select>

                        {errors.billet_edite && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.billet_edite}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block font-semibold">
                            Date d'édition du billet
                        </label>

                        <input
                            type="datetime-local"
                            value={data.billet_edite_le}
                            onChange={(e) =>
                                setData(
                                    "billet_edite_le",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.billet_edite_le && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.billet_edite_le}
                            </p>
                        )}
                    </div>

                </div>
            </div>


            {/* ============================================
                OBSERVATION
            ============================================ */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Observation
                    </h2>
                </div>

                <div className="p-6">
                    <textarea
                        rows="5"
                        value={data.observation}
                        onChange={(e) =>
                            setData("observation", e.target.value)
                        }
                        placeholder="Ajouter une observation complémentaire..."
                        className="w-full rounded-lg border p-3"
                    />

                    {errors.observation && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.observation}
                        </p>
                    )}
                </div>
            </div>


            {/* ============================================
                ACTIONS
            ============================================ */}

            <div className="flex justify-end gap-4">
                <Link
                    href={route("absences.index")}
                    className="rounded-lg border px-6 py-3 hover:bg-gray-50"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {processing
                        ? "Enregistrement..."
                        : submitLabel}
                </button>
            </div>

        </form>
    );
}