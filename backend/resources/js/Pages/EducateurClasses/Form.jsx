import { Link, useForm } from "@inertiajs/react";
import { useMemo } from "react";

export default function Form({
    affectation = null,
    etablissements = [],
    anneesScolaires = [],
    educateurs = [],
    classes = [],
    isSuperAdmin = false,
    etablissementId = null,
}) {
    const isEdit = Boolean(affectation);

    const { data, setData, post, put, processing, errors } =
        useForm({
            etablissement_id:
                affectation?.etablissement_id ??
                etablissementId ??
                "",

            annee_scolaire_id:
                affectation?.annee_scolaire_id ?? "",

            educateur_id:
                affectation?.educateur_id ?? "",

            classe_id:
                affectation?.classe_id ?? "",

            actif:
                affectation?.actif ?? true,
        });

    /*
     * Éducateurs correspondant à l'établissement.
     */
    const educateursFiltres = useMemo(() => {
        if (!data.etablissement_id) {
            return [];
        }

        return educateurs.filter(
            (educateur) =>
                Number(educateur.etablissement_id) ===
                Number(data.etablissement_id)
        );
    }, [educateurs, data.etablissement_id]);

    /*
     * Classes correspondant à l'établissement
     * et à l'année scolaire.
     */
    const classesFiltrees = useMemo(() => {
        if (
            !data.etablissement_id ||
            !data.annee_scolaire_id
        ) {
            return [];
        }

        return classes.filter(
            (classe) =>
                Number(classe.etablissement_id) ===
                    Number(data.etablissement_id) &&
                Number(classe.annee_scolaire_id) ===
                    Number(data.annee_scolaire_id)
        );
    }, [
        classes,
        data.etablissement_id,
        data.annee_scolaire_id,
    ]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route(
                    "educateur-classes.update",
                    affectation.id
                )
            );
        } else {
            post(
                route("educateur-classes.store")
            );
        }
    };

    const changementEtablissement = (value) => {
        setData("etablissement_id", value);

        /*
         * On réinitialise les choix devenus invalides.
         */
        setData("educateur_id", "");
        setData("classe_id", "");
    };

    const changementAnnee = (value) => {
        setData("annee_scolaire_id", "");
        setData("annee_scolaire_id", value);
        setData("classe_id", "");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl bg-white p-6 shadow"
        >
            {/* Établissement */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Établissement
                </label>

                <select
                    value={data.etablissement_id}
                    onChange={(e) =>
                        changementEtablissement(
                            e.target.value
                        )
                    }
                    disabled={!isSuperAdmin}
                    className="w-full rounded-lg border-gray-300 disabled:bg-gray-100"
                >
                    <option value="">
                        Sélectionner un établissement
                    </option>

                    {etablissements.map(
                        (etablissement) => (
                            <option
                                key={etablissement.id}
                                value={etablissement.id}
                            >
                                {etablissement.nom}
                            </option>
                        )
                    )}
                </select>

                {errors.etablissement_id && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.etablissement_id}
                    </p>
                )}
            </div>

            {/* Année scolaire */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Année scolaire
                </label>

                <select
                    value={data.annee_scolaire_id}
                    onChange={(e) =>
                        changementAnnee(
                            e.target.value
                        )
                    }
                    className="w-full rounded-lg border-gray-300"
                >
                    <option value="">
                        Sélectionner une année scolaire
                    </option>

                    {anneesScolaires.map((annee) => (
                        <option
                            key={annee.id}
                            value={annee.id}
                        >
                            {annee.libelle}
                            {annee.active
                                ? " — Active"
                                : ""}
                        </option>
                    ))}
                </select>

                {errors.annee_scolaire_id && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.annee_scolaire_id}
                    </p>
                )}
            </div>

            {/* Éducateur */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
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
                    disabled={
                        !data.etablissement_id
                    }
                    className="w-full rounded-lg border-gray-300 disabled:bg-gray-100"
                >
                    <option value="">
                        Sélectionner un éducateur
                    </option>

                    {educateursFiltres.map(
                        (educateur) => (
                            <option
                                key={educateur.id}
                                value={educateur.id}
                            >
                                {educateur.nom}{" "}
                                {educateur.prenoms}
                            </option>
                        )
                    )}
                </select>

                {errors.educateur_id && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.educateur_id}
                    </p>
                )}
            </div>

            {/* Classe */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Classe
                </label>

                <select
                    value={data.classe_id}
                    onChange={(e) =>
                        setData(
                            "classe_id",
                            e.target.value
                        )
                    }
                    disabled={
                        !data.etablissement_id ||
                        !data.annee_scolaire_id
                    }
                    className="w-full rounded-lg border-gray-300 disabled:bg-gray-100"
                >
                    <option value="">
                        Sélectionner une classe
                    </option>

                    {classesFiltrees.map((classe) => (
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

                {data.etablissement_id &&
                    data.annee_scolaire_id &&
                    classesFiltrees.length === 0 && (
                        <p className="mt-1 text-sm text-amber-600">
                            Aucune classe disponible
                            pour cet établissement et
                            cette année scolaire.
                        </p>
                    )}
            </div>

            {/* Statut */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={Boolean(data.actif)}
                        onChange={(e) =>
                            setData(
                                "actif",
                                e.target.checked
                            )
                        }
                        className="rounded border-gray-300"
                    />

                    <span className="text-sm font-medium text-gray-700">
                        Affectation active
                    </span>
                </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                <Link
                    href={route(
                        "educateur-classes.index"
                    )}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing
                        ? "Enregistrement..."
                        : isEdit
                        ? "Enregistrer les modifications"
                        : "Créer l’affectation"}
                </button>
            </div>
        </form>
    );
}