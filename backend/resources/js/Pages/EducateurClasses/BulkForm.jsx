import { Link, useForm } from "@inertiajs/react";
import { useEffect, useMemo } from "react";

export default function BulkForm({
    etablissements = [],
    anneesScolaires = [],
    educateurs = [],
    classes = [],
    affectationsExistantes = [],
    isSuperAdmin = false,
    etablissementId = null,
}) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        transform,
    } = useForm({
        etablissement_id: isSuperAdmin
            ? ""
            : String(etablissementId ?? ""),

        annee_scolaire_id: "",

        affectations: {},

        actif: true,
    });

    /*
     * Éducateurs appartenant à l'établissement sélectionné.
     */
    const educateursFiltres = useMemo(() => {
        return educateurs.filter(
            (educateur) =>
                String(educateur.etablissement_id) ===
                String(data.etablissement_id)
        );
    }, [
        educateurs,
        data.etablissement_id,
    ]);

    /*
     * Classes appartenant à l'établissement
     * et à l'année scolaire sélectionnés.
     */
    const classesFiltrees = useMemo(() => {
        return classes.filter(
            (classe) =>
                String(classe.etablissement_id) ===
                    String(data.etablissement_id) &&
                String(classe.annee_scolaire_id) ===
                    String(data.annee_scolaire_id)
        );
    }, [
        classes,
        data.etablissement_id,
        data.annee_scolaire_id,
    ]);

    /*
     * Prépare les affectations existantes
     * pour l'établissement + année sélectionnés.
     */
    const affectationsInitiales = useMemo(() => {
        if (
            !data.etablissement_id ||
            !data.annee_scolaire_id
        ) {
            return {};
        }

        const resultat = {};

        affectationsExistantes.forEach((affectation) => {
            if (
                String(affectation.etablissement_id) ===
                    String(data.etablissement_id) &&
                String(affectation.annee_scolaire_id) ===
                    String(data.annee_scolaire_id)
            ) {
                resultat[affectation.classe_id] =
                    String(affectation.educateur_id);
            }
        });

        return resultat;
    }, [
        affectationsExistantes,
        data.etablissement_id,
        data.annee_scolaire_id,
    ]);

    /*
     * Lorsque l'établissement ou l'année change,
     * on recharge les affectations déjà enregistrées.
     */
    useEffect(() => {
        setData(
            "affectations",
            affectationsInitiales
        );
    }, [
        affectationsInitiales,
        setData,
    ]);

    /*
     * Changement d'établissement.
     */
    function choisirEtablissement(value) {
        setData((current) => ({
            ...current,

            etablissement_id: value,

            annee_scolaire_id: "",

            affectations: {},
        }));
    }

    /*
     * Changement d'année scolaire.
     */
    function choisirAnnee(value) {
        setData((current) => ({
            ...current,

            annee_scolaire_id: value,

            affectations: {},
        }));
    }

    /*
     * Changement d'éducateur pour une classe.
     */
    function choisirEducateur(
        classeId,
        educateurId
    ) {
        setData(
            "affectations",
            {
                ...data.affectations,

                [classeId]: educateurId,
            }
        );
    }

    /*
     * Soumission.
     */
    function soumettre(event) {
        event.preventDefault();

        const affectations = classesFiltrees
            .filter(
                (classe) =>
                    data.affectations[classe.id]
            )
            .map((classe) => ({
                classe_id: classe.id,

                educateur_id:
                    data.affectations[classe.id],
            }));

        transform((current) => ({
            ...current,

            affectations,
        }));

        post(
            route(
                "educateur-classes.bulk.store"
            )
        );
    }

    return (
        <form
            onSubmit={soumettre}
            className="space-y-6"
        >
            {/* PARAMÈTRES */}
            <div className="rounded-xl bg-white p-6 shadow">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    {/* ÉTABLISSEMENT */}
                    <label className="text-sm font-semibold text-gray-700">
                        Établissement

                        <select
                            value={
                                data.etablissement_id
                            }
                            onChange={(event) =>
                                choisirEtablissement(
                                    event.target.value
                                )
                            }
                            disabled={!isSuperAdmin}
                            className="mt-2 w-full rounded-lg border-gray-300 disabled:bg-gray-100"
                        >
                            <option value="">
                                Sélectionner un établissement
                            </option>

                            {etablissements.map(
                                (etablissement) => (
                                    <option
                                        key={
                                            etablissement.id
                                        }
                                        value={
                                            etablissement.id
                                        }
                                    >
                                        {etablissement.nom}
                                    </option>
                                )
                            )}
                        </select>

                        {errors.etablissement_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {
                                    errors.etablissement_id
                                }
                            </p>
                        )}
                    </label>

                    {/* ANNÉE */}
                    <label className="text-sm font-semibold text-gray-700">
                        Année scolaire

                        <select
                            value={
                                data.annee_scolaire_id
                            }
                            onChange={(event) =>
                                choisirAnnee(
                                    event.target.value
                                )
                            }
                            disabled={
                                !data.etablissement_id
                            }
                            className="mt-2 w-full rounded-lg border-gray-300 disabled:bg-gray-100"
                        >
                            <option value="">
                                Sélectionner une année scolaire
                            </option>

                            {anneesScolaires.map(
                                (annee) => (
                                    <option
                                        key={annee.id}
                                        value={annee.id}
                                    >
                                        {
                                            annee.libelle
                                        }

                                        {annee.active
                                            ? " — Active"
                                            : ""}
                                    </option>
                                )
                            )}
                        </select>

                        {errors.annee_scolaire_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {
                                    errors.annee_scolaire_id
                                }
                            </p>
                        )}
                    </label>
                </div>
            </div>

            {/* TABLEAU */}
            {data.etablissement_id &&
                data.annee_scolaire_id && (
                    <div className="overflow-hidden rounded-xl bg-white shadow">

                        <div className="border-b bg-slate-50 px-6 py-4">
                            <h2 className="text-xl font-bold">
                                Affectation des éducateurs
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Les affectations déjà enregistrées
                                apparaissent automatiquement.
                                Vous pouvez les modifier directement.
                            </p>
                        </div>

                        <div className="overflow-x-auto p-6">
                            <table className="min-w-full text-sm">

                                <thead className="bg-slate-50 text-left">
                                    <tr>
                                        <th className="p-3">
                                            Classe
                                        </th>

                                        <th className="p-3">
                                            Éducateur responsable
                                        </th>

                                        <th className="p-3">
                                            État
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {classesFiltrees.map(
                                        (classe) => {
                                            const educateurId =
                                                data.affectations[
                                                    classe.id
                                                ];

                                            const affectationExistante =
                                                affectationsExistantes.find(
                                                    (affectation) =>
                                                        String(
                                                            affectation.etablissement_id
                                                        ) ===
                                                            String(
                                                                data.etablissement_id
                                                            ) &&
                                                        String(
                                                            affectation.annee_scolaire_id
                                                        ) ===
                                                            String(
                                                                data.annee_scolaire_id
                                                            ) &&
                                                        String(
                                                            affectation.classe_id
                                                        ) ===
                                                            String(
                                                                classe.id
                                                            )
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        classe.id
                                                    }
                                                    className="border-t"
                                                >
                                                    <td className="p-3 font-medium">
                                                        {
                                                            classe.libelle
                                                        }
                                                    </td>

                                                    <td className="p-3">
                                                        <select
                                                            value={
                                                                educateurId ??
                                                                ""
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                choisirEducateur(
                                                                    classe.id,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full rounded-lg border-gray-300"
                                                        >
                                                            <option value="">
                                                                À affecter
                                                            </option>

                                                            {educateursFiltres.map(
                                                                (
                                                                    educateur
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            educateur.id
                                                                        }
                                                                        value={
                                                                            educateur.id
                                                                        }
                                                                    >
                                                                        {
                                                                            educateur.nom
                                                                        }{" "}
                                                                        {
                                                                            educateur.prenoms
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </td>

                                                    <td className="p-3">
                                                        {affectationExistante ? (
                                                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                                Déjà affectée
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                                                Nouvelle
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}

                                    {!classesFiltrees.length && (
                                        <tr>
                                            <td
                                                colSpan="3"
                                                className="p-6 text-center text-amber-700"
                                            >
                                                Aucune classe disponible
                                                pour cette sélection.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            {/* ACTIONS */}
            <div className="rounded-xl bg-white p-6 shadow">

                <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                    <input
                        type="checkbox"
                        checked={data.actif}
                        onChange={(event) =>
                            setData(
                                "actif",
                                event.target.checked
                            )
                        }
                        className="rounded border-gray-300"
                    />

                    Affectations actives
                </label>

                {errors.affectations && (
                    <p className="mt-3 text-sm text-red-600">
                        {errors.affectations}
                    </p>
                )}

                <div className="mt-6 flex justify-end gap-4 border-t pt-6">

                    <Link
                        href={route(
                            "educateur-classes.index"
                        )}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Annuler
                    </Link>

                    <button
                        type="submit"
                        disabled={
                            processing ||
                            !classesFiltrees.length
                        }
                        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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