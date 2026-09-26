import { Link } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function BulkForm({
    etablissements = [],
    annees = [],
    classes = [],
    enseignants = [],
    affectationsExistantes = [],
    isSuperAdmin = false,
    etablissementId,
    errors = {},
    processing = false,
    submit,
}) {
    const [etablissement, setEtablissement] = useState(
        isSuperAdmin ? "" : String(etablissementId ?? ""),
    );

    const [annee, setAnnee] = useState("");

    const [classeId, setClasseId] = useState("");

    const [assignations, setAssignations] = useState({});

    const [actif, setActif] = useState(true);

    /*
    |--------------------------------------------------------------------------
    | CLASSES DISPONIBLES
    |--------------------------------------------------------------------------
    */

    const classesDisponibles = useMemo(() => {
        return classes.filter((classe) => {
            if (String(classe.etablissement_id) !== String(etablissement)) {
                return false;
            }

            if (annee && String(classe.annee_scolaire_id) !== String(annee)) {
                return false;
            }

            return true;
        });
    }, [classes, etablissement, annee]);

    /*
    |--------------------------------------------------------------------------
    | CLASSE SÉLECTIONNÉE
    |--------------------------------------------------------------------------
    */

    const classeSelectionnee = useMemo(() => {
        return classes.find((classe) => String(classe.id) === String(classeId));
    }, [classes, classeId]);

    /*
    |--------------------------------------------------------------------------
    | MATIÈRES DE LA MAQUETTE
    |--------------------------------------------------------------------------
    */

    const lignes = useMemo(() => {
        return (
            classeSelectionnee?.maquette?.lignes?.filter(
                (ligne) => ligne.active !== false,
            ) ?? []
        );
    }, [classeSelectionnee]);

    /*
    |--------------------------------------------------------------------------
    | ENSEIGNANTS DISPONIBLES
    |--------------------------------------------------------------------------
    */

    const enseignantsDisponibles = useMemo(() => {
        return enseignants.filter(
            (enseignant) =>
                String(enseignant.etablissement_id) === String(etablissement),
        );
    }, [enseignants, etablissement]);

    /*
    |--------------------------------------------------------------------------
    | ENSEIGNANTS PAR MATIÈRE
    |--------------------------------------------------------------------------
    */

    function enseignantsPourMatiere(matiereId) {
        const ligne = lignes.find(
            (item) => String(item.matiere_id) === String(matiereId),
        );

        const matiere = ligne?.matiere;

        const matiereParentId = matiere?.matiere_parent_id;

        return enseignantsDisponibles.filter((enseignant) => {
            if (!enseignant.actif) {
                return false;
            }

            const matierePrincipaleId = String(
                enseignant.matiere_principale_id ?? "",
            );

            const matiereSecondaireId = String(
                enseignant.matiere_secondaire_id ?? "",
            );

            const correspondDirectement =
                matierePrincipaleId === String(matiereId) ||
                matiereSecondaireId === String(matiereId);

            const correspondAuParent =
                matiereParentId &&
                (matierePrincipaleId === String(matiereParentId) ||
                    matiereSecondaireId === String(matiereParentId));

            return correspondDirectement || correspondAuParent;
        });
    }

    /*
    |--------------------------------------------------------------------------
    | AFFECTATIONS EXISTANTES
    |--------------------------------------------------------------------------
    */

    const affectationsClasse = useMemo(() => {
        if (!classeId) {
            return [];
        }

        return affectationsExistantes.filter(
            (affectation) => String(affectation.classe_id) === String(classeId),
        );
    }, [affectationsExistantes, classeId]);

    /*
    |--------------------------------------------------------------------------
    | SÉLECTION D'UNE CLASSE
    |--------------------------------------------------------------------------
    */

    function choisirClasse(value) {
        setClasseId(value);

        const existantes = affectationsExistantes.filter(
            (affectation) => String(affectation.classe_id) === String(value),
        );

        const nouvellesAssignations = {};

        existantes.forEach((affectation) => {
            nouvellesAssignations[affectation.matiere_id] = String(
                affectation.enseignant_id ?? "",
            );
        });

        setAssignations(nouvellesAssignations);
    }

    /*
    |--------------------------------------------------------------------------
    | CHANGEMENT D'ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    */

    function changerEtablissement(value) {
        setEtablissement(value);

        setAnnee("");

        setClasseId("");

        setAssignations({});
    }

    /*
    |--------------------------------------------------------------------------
    | CHANGEMENT D'ANNÉE
    |--------------------------------------------------------------------------
    */

    function changerAnnee(value) {
        setAnnee(value);

        setClasseId("");

        setAssignations({});
    }

    /*
    |--------------------------------------------------------------------------
    | AFFECTATION D'UNE MATIÈRE
    |--------------------------------------------------------------------------
    */

    function changerEnseignant(matiereId, enseignantId) {
        const matiereIdStr = String(matiereId);

        // Recherche de la matière sélectionnée dans la maquette
        const ligneSelectionnee = lignes.find(
            (ligne) => String(ligne.matiere_id) === matiereIdStr,
        );

        setAssignations((anciennes) => {
            const nouvelles = {
                ...anciennes,
                [matiereIdStr]: enseignantId,
            };

            // Si la matière sélectionnée est une matière principale,
            // on propage l'enseignant à ses sous-matières présentes
            // dans la maquette.
            if (ligneSelectionnee?.matiere?.enfants?.length) {
                const idsEnfants = ligneSelectionnee.matiere.enfants.map(
                    (enfant) => String(enfant.id),
                );

                idsEnfants.forEach((enfantId) => {
                    const enfantDansMaquette = lignes.some(
                        (ligne) => String(ligne.matiere_id) === enfantId,
                    );

                    if (enfantDansMaquette) {
                        nouvelles[enfantId] = enseignantId;
                    }
                });
            }

            return nouvelles;
        });
    }

    /*
    |--------------------------------------------------------------------------
    | COMPTEURS
    |--------------------------------------------------------------------------
    */

    const nombreAffectees = lignes.filter(
        (ligne) => assignations[ligne.matiere_id],
    ).length;

    const nombreNonAffectees = lignes.length - nombreAffectees;

    const affectationComplete =
        lignes.length > 0 && nombreAffectees === lignes.length;

    /*
    |--------------------------------------------------------------------------
    | SOUMISSION
    |--------------------------------------------------------------------------
    */

    function soumettre(event) {
        event.preventDefault();

        if (!classeSelectionnee) {
            return;
        }

        if (!affectationComplete) {
            return;
        }

        /*
        | IMPORTANT :
        | coefficient et volume_horaire ne sont
        | volontairement PAS envoyés.
        |
        | Laravel les récupère depuis la maquette.
        */

        submit({
            etablissement_id: etablissement,

            annee_scolaire_id: annee || classeSelectionnee.annee_scolaire_id,

            classe_id: classeId,

            affectations: lignes.map((ligne) => ({
                matiere_id: ligne.matiere_id,

                enseignant_id: assignations[ligne.matiere_id],

                actif,
            })),
        });
    }

    return (
        <form onSubmit={soumettre} className="space-y-8">
            {/* ========================================================= */}
            {/* INFORMATIONS GÉNÉRALES */}
            {/* ========================================================= */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Affectation pédagogique
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Sélectionnez une classe pour afficher automatiquement
                        les matières de sa maquette pédagogique.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    {/* ------------------------------------------------- */}
                    {/* ÉTABLISSEMENT */}
                    {/* ------------------------------------------------- */}

                    <label className="font-semibold">
                        Établissement
                        <select
                            className="mt-2 w-full rounded-lg border p-3"
                            value={etablissement}
                            disabled={!isSuperAdmin}
                            onChange={(event) =>
                                changerEtablissement(event.target.value)
                            }
                        >
                            <option value="">Sélectionner...</option>

                            {etablissements.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nom}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* ------------------------------------------------- */}
                    {/* ANNÉE */}
                    {/* ------------------------------------------------- */}

                    <label className="font-semibold">
                        Année scolaire
                        <select
                            className="mt-2 w-full rounded-lg border p-3"
                            value={annee}
                            onChange={(event) =>
                                changerAnnee(event.target.value)
                            }
                        >
                            <option value="">
                                Utiliser l'année de la classe
                            </option>

                            {annees.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.libelle}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* ------------------------------------------------- */}
                    {/* CLASSE */}
                    {/* ------------------------------------------------- */}

                    <label className="font-semibold md:col-span-2">
                        Classe
                        <select
                            className="mt-2 w-full rounded-lg border p-3"
                            value={classeId}
                            onChange={(event) =>
                                choisirClasse(event.target.value)
                            }
                            disabled={!etablissement}
                        >
                            <option value="">Sélectionner une classe...</option>

                            {classesDisponibles.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.libelle}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            {/* ========================================================= */}
            {/* MATIÈRES */}
            {/* ========================================================= */}

            {classeId && (
                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="border-b bg-slate-50 px-6 py-4">
                        <h2 className="text-xl font-bold">
                            Matières de la classe
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Les coefficients et volumes horaires proviennent
                            automatiquement de la maquette pédagogique.
                        </p>
                    </div>

                    <div className="overflow-x-auto p-6">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-left">
                                <tr>
                                    <th className="p-3">Matière</th>

                                    <th className="p-3 text-center">Coef.</th>

                                    <th className="p-3 text-center">Volume</th>

                                    <th className="p-3">Enseignant</th>
                                </tr>
                            </thead>

                            <tbody>
                                {lignes.map((ligne) => {
                                    const affectationExistante =
                                        affectationsClasse.find(
                                            (affectation) =>
                                                String(
                                                    affectation.matiere_id,
                                                ) === String(ligne.matiere_id),
                                        );

                                    const enseignants = enseignantsPourMatiere(
                                        ligne.matiere_id,
                                    );

                                    const enseignantActuel =
                                        assignations[ligne.matiere_id];

                                    const enseignantActuelExiste =
                                        enseignants.some(
                                            (enseignant) =>
                                                String(enseignant.id) ===
                                                String(enseignantActuel),
                                        );

                                    return (
                                        <tr
                                            key={ligne.matiere_id}
                                            className="border-t"
                                        >
                                            {/* MATIÈRE */}

                                            <td className="p-3 font-medium">
                                                {ligne.matiere?.libelle ?? "-"}
                                            </td>

                                            {/* COEFFICIENT */}

                                            <td className="p-3 text-center font-semibold">
                                                {ligne.coefficient}
                                            </td>

                                            {/* VOLUME */}

                                            <td className="p-3 text-center">
                                                {ligne.volume_horaire} h
                                            </td>

                                            {/* ENSEIGNANT */}

                                            <td className="p-3">
                                                <select
                                                    className="w-full rounded-lg border p-2"
                                                    value={
                                                        enseignantActuel ?? ""
                                                    }
                                                    onChange={(event) =>
                                                        changerEnseignant(
                                                            ligne.matiere_id,
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        À affecter
                                                    </option>

                                                    {enseignantActuel &&
                                                        !enseignantActuelExiste &&
                                                        affectationExistante && (
                                                            <option
                                                                value={
                                                                    enseignantActuel
                                                                }
                                                            >
                                                                Enseignant
                                                                actuellement
                                                                affecté
                                                            </option>
                                                        )}

                                                    {enseignants.map(
                                                        (enseignant) => (
                                                            <option
                                                                key={
                                                                    enseignant.id
                                                                }
                                                                value={
                                                                    enseignant.id
                                                                }
                                                            >
                                                                {enseignant.nom}{" "}
                                                                {
                                                                    enseignant.prenoms
                                                                }
                                                            </option>
                                                        ),
                                                    )}
                                                </select>

                                                {affectationExistante && (
                                                    <p className="mt-1 text-xs text-green-600">
                                                        Affectation existante
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {!lignes.length && (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="p-6 text-center text-amber-700"
                                        >
                                            Cette classe n’a pas de matière
                                            active dans sa maquette.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ================================================= */}
                    {/* COMPTEUR */}
                    {/* ================================================= */}

                    {lignes.length > 0 && (
                        <div className="border-t px-6 py-4">
                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                <span>
                                    <strong>{lignes.length}</strong> matières
                                </span>

                                <span className="text-green-600">
                                    <strong>{nombreAffectees}</strong> affectées
                                </span>

                                <span className="text-amber-600">
                                    <strong>{nombreNonAffectees}</strong> à
                                    affecter
                                </span>

                                {affectationComplete && (
                                    <span className="font-semibold text-green-700">
                                        ✓ Affectation complète
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================= */}
            {/* OPTIONS */}
            {/* ========================================================= */}

            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <label className="flex items-center gap-3 font-semibold">
                    <input
                        type="checkbox"
                        checked={actif}
                        onChange={(event) => setActif(event.target.checked)}
                    />
                    Affectations actives
                </label>

                {Object.values(errors).map((error, index) => (
                    <p key={index} className="mt-3 text-sm text-red-600">
                        {error}
                    </p>
                ))}

                {!affectationComplete && lignes.length > 0 && classeId && (
                    <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                        Toutes les matières actives de la maquette doivent être
                        affectées avant l'enregistrement.
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-4">
                    <Link
                        href={route("affectations.index")}
                        className="rounded-lg border px-6 py-3 hover:bg-gray-50"
                    >
                        Annuler
                    </Link>

                    <button
                        type="submit"
                        disabled={
                            processing ||
                            !classeId ||
                            !lignes.length ||
                            !affectationComplete
                        }
                        className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing
                            ? "Enregistrement..."
                            : "Enregistrer les affectations"}
                    </button>
                </div>
            </div>
        </form>
    );
}
