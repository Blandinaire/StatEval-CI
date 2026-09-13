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
    errors = {},
    processing = false,
    submit,
    submitLabel = "Enregistrer",
}) {
    /*
    |--------------------------------------------------------------------------
    | Classes filtrées
    |--------------------------------------------------------------------------
    */

    const classesFiltrees = classes.filter((classe) => {
        const memeEtablissement =
            !data.etablissement_id ||
            String(classe.etablissement_id) === String(data.etablissement_id);

        const memeAnnee =
            !data.annee_scolaire_id ||
            String(classe.annee_scolaire_id) === String(data.annee_scolaire_id);

        return memeEtablissement && memeAnnee;
    });

    /*
    |--------------------------------------------------------------------------
    | Élèves filtrés
    |--------------------------------------------------------------------------
    */

    const elevesFiltres = eleves.filter((eleve) => {
        const memeEtablissement =
            !data.etablissement_id ||
            String(eleve.etablissement_id) === String(data.etablissement_id);

        const memeClasse =
            !data.classe_id ||
            String(eleve.classe_id) === String(data.classe_id);

        return memeEtablissement && memeClasse;
    });

    /*
    |--------------------------------------------------------------------------
    | Éducateurs filtrés
    |--------------------------------------------------------------------------
    */

    const educateursFiltres = educateurs.filter((educateur) => {
        if (!data.etablissement_id) {
            return true;
        }

        return (
            String(educateur.etablissement_id) === String(data.etablissement_id)
        );
    });

    /*
    |--------------------------------------------------------------------------
    | Calcul de la durée
    |--------------------------------------------------------------------------
    */

    function calculerDuree() {
        if (!data.heure_prevue || !data.heure_arrivee) {
            return 0;
        }

        const [heurePrevue, minutePrevue] = data.heure_prevue
            .split(":")
            .map(Number);

        const [heureArrivee, minuteArrivee] = data.heure_arrivee
            .split(":")
            .map(Number);

        const minutesPrevues = heurePrevue * 60 + minutePrevue;

        const minutesArrivee = heureArrivee * 60 + minuteArrivee;

        return Math.max(0, minutesArrivee - minutesPrevues);
    }

    const dureeCalculee = calculerDuree();

    /*
    |--------------------------------------------------------------------------
    | Changement établissement
    |--------------------------------------------------------------------------
    */

    function handleEtablissementChange(value) {
        setData("etablissement_id", value);
        setData("classe_id", "");
        setData("eleve_id", "");
        setData("educateur_id", "");
    }

    /*
    |--------------------------------------------------------------------------
    | Changement année scolaire
    |--------------------------------------------------------------------------
    */

    function handleAnneeChange(value) {
        setData("annee_scolaire_id", value);
        setData("classe_id", "");
        setData("eleve_id", "");
    }

    /*
    |--------------------------------------------------------------------------
    | Changement classe
    |--------------------------------------------------------------------------
    */

    function handleClasseChange(value) {
        setData("classe_id", value);
        setData("eleve_id", "");
    }

    /*
    |--------------------------------------------------------------------------
    | Changement élève
    |--------------------------------------------------------------------------
    */

    function handleEleveChange(value) {
        setData("eleve_id", value);

        const eleveSelectionne = eleves.find(
            (eleve) => String(eleve.id) === String(value),
        );

        if (eleveSelectionne?.classe_id) {
            setData("classe_id", eleveSelectionne.classe_id);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Heure prévue
    |--------------------------------------------------------------------------
    */

    function handleHeurePrevue(value) {
        setData("heure_prevue", value);

        if (value && data.heure_arrivee) {
            const [h1, m1] = value.split(":").map(Number);

            const [h2, m2] = data.heure_arrivee.split(":").map(Number);

            const duree = Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));

            setData("duree_minutes", duree);
        } else {
            setData("duree_minutes", 0);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Heure arrivée
    |--------------------------------------------------------------------------
    */

    function handleHeureArrivee(value) {
        setData("heure_arrivee", value);

        if (value && data.heure_prevue) {
            const [h1, m1] = data.heure_prevue.split(":").map(Number);

            const [h2, m2] = value.split(":").map(Number);

            const duree = Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));

            setData("duree_minutes", duree);
        } else {
            setData("duree_minutes", 0);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-8">
            {/* =====================================================
                INFORMATIONS SUR LE RETARD
            ===================================================== */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Informations sur le retard
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    {/* Établissement */}

                    {isSuperAdmin && (
                        <div>
                            <label className="mb-2 block font-semibold">
                                Établissement
                            </label>

                            <select
                                value={data.etablissement_id}
                                onChange={(e) =>
                                    handleEtablissementChange(e.target.value)
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
                        </div>
                    )}

                    {/* Année scolaire */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Année scolaire
                        </label>

                        <select
                            value={data.annee_scolaire_id}
                            onChange={(e) => handleAnneeChange(e.target.value)}
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

                    {/* Classe */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Classe
                        </label>

                        <select
                            value={data.classe_id}
                            disabled={!data.annee_scolaire_id}
                            onChange={(e) => handleClasseChange(e.target.value)}
                            className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            <option value="">
                                {!data.annee_scolaire_id
                                    ? "Sélectionnez d'abord une année..."
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

                    {/* Élève */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Élève
                        </label>

                        <select
                            value={data.eleve_id}
                            disabled={!data.classe_id}
                            onChange={(e) => handleEleveChange(e.target.value)}
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

                    {/* Éducateur */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Éducateur
                        </label>

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

            {/* =====================================================
                DATE ET DURÉE
            ===================================================== */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">Date et durée</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    {/* Date */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Date du retard
                        </label>

                        <input
                            type="date"
                            value={data.date_retard}
                            onChange={(e) =>
                                setData("date_retard", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.date_retard && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.date_retard}
                            </p>
                        )}
                    </div>

                    {/* Durée */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Durée du retard
                        </label>

                        <div className="w-full rounded-lg border bg-orange-50 p-3">
                            <span className="font-semibold text-orange-600">
                                {dureeCalculee} minute
                                {dureeCalculee > 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    {/* Heure prévue */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Heure prévue
                        </label>

                        <input
                            type="time"
                            value={data.heure_prevue}
                            onChange={(e) => handleHeurePrevue(e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.heure_prevue && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.heure_prevue}
                            </p>
                        )}
                    </div>

                    {/* Heure arrivée */}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Heure d'arrivée
                        </label>

                        <input
                            type="time"
                            value={data.heure_arrivee}
                            onChange={(e) => handleHeureArrivee(e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.heure_arrivee && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.heure_arrivee}
                            </p>
                        )}
                    </div>
                </div>

                <input
                    type="hidden"
                    name="duree_minutes"
                    value={dureeCalculee}
                    readOnly
                />
            </div>

            {/* =====================================================
                BILLET
            ===================================================== */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">Billet de retard</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block font-semibold">
                            Numéro du billet
                        </label>

                        <div className="rounded-lg border bg-gray-50 p-3 font-medium text-gray-700">
                            {data.numero_billet
                                ? data.numero_billet
                                : "Généré automatiquement à l'enregistrement"}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Statut du billet
                        </label>

                        <div
                            className={`rounded-lg border p-3 font-medium ${
                                data.billet_edite
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-orange-200 bg-orange-50 text-orange-600"
                            }`}
                        >
                            {data.billet_edite
                                ? `Édité${
                                      data.billet_edite_le
                                          ? ` le ${data.billet_edite_le}`
                                          : ""
                                  }`
                                : "Non édité"}
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                MOTIF
            ===================================================== */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">Motif</h2>
                </div>

                <div className="p-6">
                    <textarea
                        rows="4"
                        value={data.motif}
                        onChange={(e) => setData("motif", e.target.value)}
                        placeholder="Indiquer éventuellement le motif du retard..."
                        className="w-full rounded-lg border p-3"
                    />

                    {errors.motif && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.motif}
                        </p>
                    )}
                </div>
            </div>

            {/* =====================================================
                OBSERVATION
            ===================================================== */}

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
            ===================================================== */}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                    href={route("retards.index")}
                    className="rounded-lg border px-6 py-3 text-center hover:bg-gray-50"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing ? "Enregistrement..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
