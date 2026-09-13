import { useEffect } from "react";
import { Link } from "@inertiajs/react";

export default function Form({
    data,
    setData,
    eleves = [],
    educateurs = [],
    anneesScolaires = [],
    classes = [],
    etablissements = [],
    isSuperAdmin = false,
    isEducateur = false,
    errors = {},
    processing,
    submit,
    submitLabel = "Enregistrer",
}) {
    /*
     * ============================================================
     * ÉTABLISSEMENTS
     * ============================================================
     */

    const etablissementsFiltrees = etablissements;

    /*
     * ============================================================
     * ÉDUCATEUR CONNECTÉ
     *
     * Pour un éducateur connecté, le backend ne fournit
     * normalement que son propre éducateur.
     *
     * On récupère donc son identifiant.
     * ============================================================
     */

    const educateurConnecte = isEducateur ? (educateurs[0] ?? null) : null;

    /*
     * ============================================================
     * INITIALISATION AUTOMATIQUE DE L'ÉDUCATEUR
     *
     * L'éducateur connecté ne doit pas avoir à sélectionner
     * son propre nom.
     * ============================================================
     */

    useEffect(() => {
        if (
            isEducateur &&
            educateurConnecte &&
            String(data.educateur_id || "") !== String(educateurConnecte.id)
        ) {
            setData("educateur_id", educateurConnecte.id);
        }
    }, [isEducateur, educateurConnecte?.id, data.educateur_id, setData]);

    /*
     * ============================================================
     * CLASSES
     *
     * Le backend fournit déjà les classes autorisées.
     *
     * On applique uniquement les filtres :
     * 1. établissement
     * 2. année scolaire
     * ============================================================
     */

    const classesFiltrees = classes.filter((classe) => {
        const correspondEtablissement =
            !data.etablissement_id ||
            String(classe.etablissement_id) === String(data.etablissement_id);

        const correspondAnnee =
            !data.annee_scolaire_id ||
            String(classe.annee_scolaire_id) === String(data.annee_scolaire_id);

        return correspondEtablissement && correspondAnnee;
    });

    /*
     * ============================================================
     * ÉLÈVES
     *
     * Filtrage :
     * 1. établissement
     * 2. classe
     * ============================================================
     */

    const elevesFiltres = eleves.filter((eleve) => {
        const correspondEtablissement =
            !data.etablissement_id ||
            String(eleve.etablissement_id) === String(data.etablissement_id);

        const correspondClasse =
            !data.classe_id ||
            String(eleve.classe_id) === String(data.classe_id);

        return correspondEtablissement && correspondClasse;
    });

    /*
     * ============================================================
     * ÉDUCATEURS
     *
     * SuperAdmin :
     * tous les éducateurs de l'établissement sélectionné.
     *
     * Administrateur / Direction :
     * éducateurs de leur établissement.
     *
     * Éducateur :
     * uniquement lui-même.
     * ============================================================
     */

    const educateursFiltres = educateurs.filter((educateur) => {
        return (
            !data.etablissement_id ||
            String(educateur.etablissement_id) === String(data.etablissement_id)
        );
    });

    /*
     * ============================================================
     * CHANGEMENT D'ÉTABLISSEMENT
     * ============================================================
     */

    function changerEtablissement(e) {
        const etablissementId = e.target.value;

        setData("etablissement_id", etablissementId);

        /*
         * Réinitialisation des données dépendantes.
         */
        setData("annee_scolaire_id", "");
        setData("classe_id", "");
        setData("eleve_id", "");

        /*
         * Pour le SuperAdmin, l'éducateur doit être
         * resélectionné après changement d'établissement.
         *
         * Pour un éducateur connecté, son éducateur
         * est imposé et ne doit jamais être supprimé.
         */
        if (!isEducateur) {
            setData("educateur_id", "");
        }
    }

    /*
     * ============================================================
     * CHANGEMENT D'ANNÉE SCOLAIRE
     * ============================================================
     */

    function changerAnneeScolaire(e) {
        const anneeId = e.target.value;

        setData("annee_scolaire_id", anneeId);
        setData("classe_id", "");
        setData("eleve_id", "");
    }

    /*
     * ============================================================
     * CHANGEMENT DE CLASSE
     * ============================================================
     */

    function changerClasse(e) {
        const classeId = e.target.value;

        setData("classe_id", classeId);
        setData("eleve_id", "");
    }

    return (
        <form onSubmit={submit} className="space-y-8">
            {/* =====================================================
                INFORMATIONS SUR L'ABSENCE
            ====================================================== */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Informations sur l'absence
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    {/* =================================================
                        ÉTABLISSEMENT
                    ================================================== */}

                    {isSuperAdmin && (
                        <div>
                            <label className="mb-2 block font-semibold">
                                Établissement
                            </label>

                            <select
                                value={data.etablissement_id}
                                onChange={changerEtablissement}
                                className="w-full rounded-lg border p-3"
                            >
                                <option value="">
                                    Sélectionner un établissement...
                                </option>

                                {etablissementsFiltrees.map((etablissement) => (
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
                        </div>
                    )}

                    {/* =================================================
                        ANNÉE SCOLAIRE
                    ================================================== */}

                    <div className={isSuperAdmin ? "" : "md:col-span-2"}>
                        <label className="mb-2 block font-semibold">
                            Année scolaire
                        </label>

                        <select
                            value={data.annee_scolaire_id}
                            onChange={changerAnneeScolaire}
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner une année...</option>

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

                    {/* =================================================
                        CLASSE
                    ================================================== */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Classe
                        </label>

                        <select
                            value={data.classe_id}
                            disabled={
                                !data.annee_scolaire_id ||
                                (isSuperAdmin && !data.etablissement_id)
                            }
                            onChange={changerClasse}
                            className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            <option value="">
                                {!data.annee_scolaire_id
                                    ? "Sélectionnez d'abord une année..."
                                    : isSuperAdmin && !data.etablissement_id
                                      ? "Sélectionnez d'abord un établissement..."
                                      : "Sélectionner une classe..."}
                            </option>

                            {classesFiltrees.map((classe) => (
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

                    {/* =================================================
                        ÉLÈVE
                    ================================================== */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Élève
                        </label>

                        <select
                            value={data.eleve_id}
                            disabled={!data.classe_id}
                            onChange={(e) =>
                                setData("eleve_id", e.target.value)
                            }
                            className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            <option value="">
                                {!data.classe_id
                                    ? "Sélectionnez d'abord une classe..."
                                    : "Sélectionner un élève..."}
                            </option>

                            {elevesFiltres.map((eleve) => (
                                <option key={eleve.id} value={eleve.id}>
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

                    {/* =================================================
                        ÉDUCATEUR
                    ================================================== */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Éducateur
                        </label>

                        {isEducateur ? (
                            /*
                             * ------------------------------------------------
                             * ÉDUCATEUR CONNECTÉ
                             * ------------------------------------------------
                             *
                             * Son identité est automatiquement imposée.
                             */
                            <div>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={
                                            data.educateur_id ||
                                            educateurConnecte?.id ||
                                            ""
                                        }
                                        disabled
                                        className="w-full cursor-not-allowed rounded-lg border bg-gray-100 p-3 text-gray-700"
                                    >
                                        <option value="">
                                            Éducateur connecté
                                        </option>

                                        {educateurConnecte && (
                                            <option
                                                value={educateurConnecte.id}
                                            >
                                                {educateurConnecte.nom}{" "}
                                                {educateurConnecte.prenoms}
                                            </option>
                                        )}
                                    </select>

                                    <span
                                        className="whitespace-nowrap rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700"
                                        title="Éducateur imposé par le compte connecté"
                                    >
                                        🔒
                                    </span>
                                </div>

                                <p className="mt-1 text-xs text-gray-500">
                                    L'éducateur est automatiquement défini selon
                                    votre compte.
                                </p>
                            </div>
                        ) : (
                            /*
                             * ------------------------------------------------
                             * SUPERADMIN / ADMINISTRATION
                             * ------------------------------------------------
                             */
                            <select
                                value={data.educateur_id}
                                onChange={(e) =>
                                    setData("educateur_id", e.target.value)
                                }
                                className="w-full rounded-lg border p-3"
                            >
                                <option value="">
                                    Aucun éducateur sélectionné
                                </option>

                                {educateursFiltres.map((educateur) => (
                                    <option
                                        key={educateur.id}
                                        value={educateur.id}
                                    >
                                        {educateur.nom} {educateur.prenoms}
                                    </option>
                                ))}
                            </select>
                        )}

                        {errors.educateur_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.educateur_id}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* =====================================================
                DATE ET DURÉE
            ====================================================== */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">Date et durée</h2>
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
                                setData("date_absence", e.target.value)
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
                                setData("duree_heures", e.target.value)
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
                                setData("heure_debut", e.target.value)
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
                                setData("heure_fin", e.target.value)
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

            {/* =====================================================
                JUSTIFICATION
            ====================================================== */}

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
                                setData("justifiee", e.target.value === "1")
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="0">Non justifiée</option>

                            <option value="1">Justifiée</option>
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
                            onChange={(e) => setData("motif", e.target.value)}
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

            {/* =====================================================
                OBSERVATION
            ====================================================== */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">Observation</h2>
                </div>

                <div className="p-6">
                    <textarea
                        rows="5"
                        value={data.observation}
                        onChange={(e) => setData("observation", e.target.value)}
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

            {/* =====================================================
                ACTIONS
            ====================================================== */}

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
                    {processing ? "Enregistrement..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
