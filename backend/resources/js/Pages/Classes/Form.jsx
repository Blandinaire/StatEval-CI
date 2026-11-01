import { Link } from "@inertiajs/react";

export default function Form({
    data = {},
    setData,
    etablissements,
    etablissementUtilisateur,
    estSuperAdmin = false,
    anneeActive,
    cycles,
    niveaux,
    series,
    maquettes,
    salles,
    enseignants = [],
    eleves = [],
    errors = {},
    processing = false,
    submit,
    submitLabel = "Enregistrer",
}) {
    /*
    |--------------------------------------------------------------------------
    | SÉCURISATION ABSOLUE DES DONNÉES
    |--------------------------------------------------------------------------
    */

    const etablissementsListe = Array.isArray(etablissements)
        ? etablissements
        : [];

    const cyclesListe = Array.isArray(cycles) ? cycles : [];

    const niveauxListe = Array.isArray(niveaux) ? niveaux : [];

    const seriesListe = Array.isArray(series) ? series : [];

    const maquettesListe = Array.isArray(maquettes) ? maquettes : [];

    const sallesListe = Array.isArray(salles) ? salles : [];

    /*
|--------------------------------------------------------------------------
| SALLES DE L'ÉTABLISSEMENT
|--------------------------------------------------------------------------
*/

    const sallesDisponibles = sallesListe.filter((salle) => {
        return (
            !data.etablissement_id ||
            String(salle.etablissement_id) === String(data.etablissement_id)
        );
    });

    const enseignantsDisponibles = enseignants.filter(
        (enseignant) =>
            !data.etablissement_id ||
            String(enseignant.etablissement_id ?? data.etablissement_id) ===
                String(data.etablissement_id),
    );

    const elevesDisponibles = Array.isArray(eleves) ? eleves : [];
    /*
    |--------------------------------------------------------------------------
    | PRÉFIXES DES CLASSES
    |--------------------------------------------------------------------------
    */

    const prefixesNiveaux = {
        Sixième: "6ème",
        Cinquième: "5ème",
        Quatrième: "4ème",
        Troisième: "3ème",
        Seconde: "2nde",
        Première: "1ère",
        Terminale: "Tle",
    };

    /*
    |--------------------------------------------------------------------------
    | NIVEAU SÉLECTIONNÉ
    |--------------------------------------------------------------------------
    */

    const niveauSelectionne = niveauxListe.find(
        (niveau) => String(niveau.id) === String(data.niveau_id),
    );

    /*
    |--------------------------------------------------------------------------
    | PRÉFIXE DE LA CLASSE
    |--------------------------------------------------------------------------
    */

    const prefixeClasse = niveauSelectionne
        ? prefixesNiveaux[niveauSelectionne.libelle] ||
          niveauSelectionne.libelle
        : "";

    /*
    |--------------------------------------------------------------------------
    | CONSTRUCTION DU LIBELLÉ
    |--------------------------------------------------------------------------
    */

    function construireLibelle(prefixe, suffixe) {
        const p = prefixe ? String(prefixe).trim() : "";

        const s = suffixe ? String(suffixe).trim() : "";

        if (!p && !s) {
            return "";
        }

        if (!p) {
            return s;
        }

        if (!s) {
            return p;
        }

        return `${p} ${s}`;
    }

    /*
    |--------------------------------------------------------------------------
    | MAQUETTES DE L'ÉTABLISSEMENT ET DE L'ANNÉE
    |--------------------------------------------------------------------------
    */

    const maquettesAnneeActives = maquettesListe.filter((maquette) => {
        if (
            String(maquette.annee_scolaire_id) !==
            String(data.annee_scolaire_id)
        ) {
            return false;
        }

        /*
         * Une version active est proposée.
         *
         * Une version inactive déjà utilisée par une classe
         * reste disponible dans le formulaire de modification.
         */
        return (
            Boolean(maquette.active) ||
            String(maquette.id) === String(data.maquette_id)
        );
    });

    /*
    |--------------------------------------------------------------------------
    | NIVEAUX DISPONIBLES
    |--------------------------------------------------------------------------
    */

    const niveauxDisponibles = niveauxListe.filter((niveau) => {
        return maquettesAnneeActives.some(
            (maquette) =>
                String(maquette.cycle_id) === String(data.cycle_id) &&
                String(maquette.niveau_id) === String(niveau.id),
        );
    });

    /*
    |--------------------------------------------------------------------------
    | SÉRIES DISPONIBLES
    |--------------------------------------------------------------------------
    */

    const seriesDisponibles = seriesListe.filter((serie) => {
        return (
            String(serie.cycle_id) === String(data.cycle_id) &&
            Boolean(serie.actif)
        );
    });

    /*
    |--------------------------------------------------------------------------
    | MAQUETTES DISPONIBLES
    |--------------------------------------------------------------------------
    */

    const maquettesDisponibles = maquettesAnneeActives.filter((maquette) => {
        if (String(maquette.cycle_id) !== String(data.cycle_id)) {
            return false;
        }

        if (String(maquette.niveau_id) !== String(data.niveau_id)) {
            return false;
        }

        /*
                |----------------------------------------------------------
                | Sans série
                |----------------------------------------------------------
                */

        if (!data.serie_id) {
            return !maquette.serie_id;
        }

        /*
                |----------------------------------------------------------
                | Avec série
                |----------------------------------------------------------
                */

        return String(maquette.serie_id) === String(data.serie_id);
    });

    /*
    |--------------------------------------------------------------------------
    | CHANGEMENT ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    */

    function changerEtablissement(value) {
        setData({
            ...data,

            etablissement_id: value,

            cycle_id: "",
            niveau_id: "",
            serie_id: "",
            maquette_id: "",
            salle_id: "",
            professeur_principal_id: "",
            delegue_id: "",
            sous_delegue_id: "",

            suffixe: "",
            libelle: "",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CHANGEMENT CYCLE
    |--------------------------------------------------------------------------
    */

    function changerCycle(value) {
        setData({
            ...data,

            cycle_id: value,

            niveau_id: "",
            serie_id: "",
            maquette_id: "",

            suffixe: "",
            libelle: "",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CHANGEMENT NIVEAU
    |--------------------------------------------------------------------------
    */

    function changerNiveau(value) {
        const niveau = niveauxListe.find(
            (item) => String(item.id) === String(value),
        );

        const prefixe = niveau
            ? prefixesNiveaux[niveau.libelle] || niveau.libelle
            : "";

        const nouveauLibelle = construireLibelle(prefixe, data.suffixe || "");

        setData({
            ...data,

            niveau_id: value,

            serie_id: "",
            maquette_id: "",

            libelle: nouveauLibelle,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CHANGEMENT SÉRIE
    |--------------------------------------------------------------------------
    */

    function changerSerie(value) {
        setData({
            ...data,

            serie_id: value,

            maquette_id: "",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CHANGEMENT SUFFIXE
    |--------------------------------------------------------------------------
    */

    function changerSuffixe(value) {
        const suffixe = String(value).toUpperCase();

        const nouveauLibelle = construireLibelle(prefixeClasse, suffixe);

        setData({
            ...data,

            suffixe,

            libelle: nouveauLibelle,
        });
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* ========================================================
                ÉTABLISSEMENT
            ======================================================== */}

            <div>
                <label className="block font-semibold mb-2">
                    Établissement
                </label>

                {estSuperAdmin ? (
                    <select
                        value={data.etablissement_id || ""}
                        onChange={(e) => changerEtablissement(e.target.value)}
                        className="w-full border rounded-lg p-3"
                    >
                        <option value="">-- Sélectionner --</option>

                        {etablissementsListe.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.nom}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        value={etablissementUtilisateur?.nom || ""}
                        readOnly
                        className="
                            w-full
                            border
                            rounded-lg
                            p-3
                            bg-gray-100
                            text-gray-700
                            cursor-not-allowed
                        "
                    />
                )}

                {errors.etablissement_id && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.etablissement_id}
                    </p>
                )}
            </div>

            {/* ========================================================
                ANNÉE SCOLAIRE
            ======================================================== */}

            <div>
                <label className="block font-semibold mb-2">
                    Année scolaire
                </label>

                <input
                    type="text"
                    value={anneeActive?.libelle || ""}
                    readOnly
                    className="
                        w-full
                        border
                        rounded-lg
                        p-3
                        bg-gray-100
                        text-gray-700
                        cursor-not-allowed
                    "
                />

                <p className="text-sm text-gray-500 mt-1">
                    L'année scolaire active est utilisée automatiquement.
                </p>

                {errors.annee_scolaire_id && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.annee_scolaire_id}
                    </p>
                )}
            </div>

            {/* ========================================================
                CYCLE
            ======================================================== */}

            <div>
                <label className="block font-semibold mb-2">Cycle</label>

                <select
                    value={data.cycle_id || ""}
                    onChange={(e) => changerCycle(e.target.value)}
                    disabled={!data.etablissement_id}
                    className="
                        w-full
                        border
                        rounded-lg
                        p-3
                        disabled:bg-gray-100
                        disabled:cursor-not-allowed
                    "
                >
                    <option value="">-- Sélectionner --</option>

                    {cyclesListe.map((cycle) => (
                        <option key={cycle.id} value={cycle.id}>
                            {cycle.libelle}
                        </option>
                    ))}
                </select>

                {errors.cycle_id && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.cycle_id}
                    </p>
                )}
            </div>

            {/* ========================================================
                NIVEAU
            ======================================================== */}

            <div>
                <label className="block font-semibold mb-2">Niveau</label>

                <select
                    value={data.niveau_id || ""}
                    onChange={(e) => changerNiveau(e.target.value)}
                    disabled={!data.cycle_id}
                    className="
                        w-full
                        border
                        rounded-lg
                        p-3
                        disabled:bg-gray-100
                        disabled:cursor-not-allowed
                    "
                >
                    <option value="">-- Sélectionner un niveau --</option>

                    {niveauxDisponibles.map((niveau) => (
                        <option key={niveau.id} value={niveau.id}>
                            {niveau.libelle}
                        </option>
                    ))}
                </select>

                {data.cycle_id && niveauxDisponibles.length === 0 && (
                    <p className="text-orange-600 text-sm mt-1">
                        Aucun niveau disponible pour ce cycle dans les maquettes
                        pédagogiques.
                    </p>
                )}

                {errors.niveau_id && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.niveau_id}
                    </p>
                )}
            </div>

            {/* ========================================================
                SÉRIE
            ======================================================== */}

            <div>
                <label className="block font-semibold mb-2">Série</label>

                <select
                    value={data.serie_id || ""}
                    onChange={(e) => changerSerie(e.target.value)}
                    disabled={!data.cycle_id}
                    className="
                        w-full
                        border
                        rounded-lg
                        p-3
                        disabled:bg-gray-100
                        disabled:cursor-not-allowed
                    "
                >
                    <option value="">Aucune</option>

                    {seriesDisponibles.map((serie) => (
                        <option key={serie.id} value={serie.id}>
                            {serie.libelle}
                        </option>
                    ))}
                </select>

                <p className="text-sm text-gray-500 mt-1">
                    Laissez « Aucune » pour les niveaux sans série.
                </p>

                {errors.serie_id && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.serie_id}
                    </p>
                )}
            </div>

            {/* ========================================================
                MAQUETTE
            ======================================================== */}

            <div>
                <label className="block font-semibold mb-2">
                    Maquette pédagogique
                </label>

                <select
                    value={data.maquette_id || ""}
                    onChange={(e) => setData("maquette_id", e.target.value)}
                    disabled={
                        !data.etablissement_id ||
                        !data.cycle_id ||
                        !data.niveau_id
                    }
                    className="
                        w-full
                        border
                        rounded-lg
                        p-3
                        disabled:bg-gray-100
                        disabled:cursor-not-allowed
                    "
                >
                    <option value="">-- Sélectionner --</option>

                    {maquettesDisponibles.map((maquette) => (
                        <option key={maquette.id} value={maquette.id}>
                            V{maquette.version ?? 1} — {maquette.libelle}
                            {maquette.nom_version
                                ? ` · ${maquette.nom_version}`
                                : ""}
                            {!maquette.active ? " (inactive)" : ""}
                        </option>
                    ))}
                </select>

                {errors.maquette_id && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.maquette_id}
                    </p>
                )}
            </div>

            {/* ========================================================
                NOM DE LA CLASSE
            ======================================================== */}

            <div>
                <label className="block font-semibold mb-3">
                    Nom de la classe
                </label>

                <div
                    className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-4
                "
                >
                    <div>
                        <label
                            className="
                            block
                            text-sm
                            text-gray-600
                            mb-1
                        "
                        >
                            Niveau
                        </label>

                        <input
                            type="text"
                            value={prefixeClasse}
                            readOnly
                            placeholder="
                                Sélectionnez un niveau
                            "
                            className="
                                w-full
                                border
                                rounded-lg
                                p-3
                                bg-gray-100
                                text-gray-700
                            "
                        />
                    </div>

                    <div>
                        <label
                            className="
                            block
                            text-sm
                            text-gray-600
                            mb-1
                        "
                        >
                            Lettre ou numéro
                        </label>

                        <input
                            type="text"
                            value={data.suffixe || ""}
                            onChange={(e) => changerSuffixe(e.target.value)}
                            placeholder="
                                Ex : A, B, C, 1, 2...
                            "
                            disabled={!data.niveau_id}
                            className="
                                w-full
                                border
                                rounded-lg
                                p-3
                                disabled:bg-gray-100
                            "
                        />
                    </div>
                </div>

                {prefixeClasse && (
                    <div
                        className="
                        mt-4
                        rounded-lg
                        bg-blue-50
                        border
                        border-blue-200
                        p-4
                    "
                    >
                        <span
                            className="
                            text-sm
                            text-gray-600
                        "
                        >
                            Libellé de la classe
                        </span>

                        <div
                            className="
                            text-xl
                            font-bold
                            text-blue-700
                            mt-1
                        "
                        >
                            {data.libelle || prefixeClasse}
                        </div>
                    </div>
                )}

                {errors.libelle && (
                    <p
                        className="
                        text-red-600
                        text-sm
                        mt-1
                    "
                    >
                        {errors.libelle}
                    </p>
                )}
            </div>

            {/* ========================================================
                CAPACITÉ
            ======================================================== */}

            <div>
                <label className="block font-semibold mb-2">Capacité</label>

                <input
                    type="number"
                    min="1"
                    value={data.capacite || ""}
                    onChange={(e) => setData("capacite", e.target.value)}
                    className="
                        w-full
                        border
                        rounded-lg
                        p-3
                    "
                />

                {errors.capacite && (
                    <p
                        className="
                        text-red-600
                        text-sm
                        mt-1
                    "
                    >
                        {errors.capacite}
                    </p>
                )}
            </div>

            {/* ========================================================
    SALLE PAR DÉFAUT
======================================================== */}

            <div>
                <label htmlFor="salle_id" className="block font-semibold mb-2">
                    Salle par défaut
                </label>

                <select
                    id="salle_id"
                    value={data.salle_id || ""}
                    onChange={(e) => setData("salle_id", e.target.value || "")}
                    disabled={!data.etablissement_id}
                    className="
            w-full
            border
            rounded-lg
            p-3
            disabled:bg-gray-100
            disabled:cursor-not-allowed
        "
                >
                    <option value="">-- Aucune salle définie --</option>

                    {sallesDisponibles.map((salle) => (
                        <option key={salle.id} value={salle.id}>
                            {salle.nom}
                            {salle.capacite
                                ? ` — ${salle.capacite} places`
                                : ""}
                        </option>
                    ))}
                </select>

                {errors.salle_id && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.salle_id}
                    </p>
                )}

                <p className="text-sm text-gray-500 mt-1">
                    Cette salle sera proposée automatiquement dans l'emploi du
                    temps de cette classe.
                </p>
            </div>

            <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">
                        Informations pédagogiques
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Désignez les responsables de la classe et ajoutez une
                        observation utile à son suivi.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="professeur_principal_id"
                        className="mb-2 block font-semibold"
                    >
                        Professeur principal
                    </label>
                    <select
                        id="professeur_principal_id"
                        value={data.professeur_principal_id || ""}
                        onChange={(event) =>
                            setData(
                                "professeur_principal_id",
                                event.target.value,
                            )
                        }
                        disabled={!data.etablissement_id}
                        className="w-full rounded-lg border p-3 disabled:bg-gray-100"
                    >
                        <option value="">Aucun professeur principal</option>
                        {enseignantsDisponibles.map((enseignant) => (
                            <option key={enseignant.id} value={enseignant.id}>
                                {enseignant.nom} {enseignant.prenoms}
                            </option>
                        ))}
                    </select>
                    {errors.professeur_principal_id && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.professeur_principal_id}
                        </p>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {[
                        ["delegue_id", "Délégué de classe"],
                        ["sous_delegue_id", "Sous-délégué de classe"],
                    ].map(([field, label]) => (
                        <div key={field}>
                            <label
                                htmlFor={field}
                                className="mb-2 block font-semibold"
                            >
                                {label}
                            </label>
                            <select
                                id={field}
                                value={data[field] || ""}
                                onChange={(event) =>
                                    setData(field, event.target.value)
                                }
                                disabled={elevesDisponibles.length === 0}
                                className="w-full rounded-lg border p-3 disabled:bg-gray-100"
                            >
                                <option value="">
                                    Aucun élève désigné
                                </option>
                                {elevesDisponibles.map((eleve) => (
                                    <option key={eleve.id} value={eleve.id}>
                                        {eleve.nom} {eleve.prenoms}
                                        {eleve.matricule
                                            ? ` — ${eleve.matricule}`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                            {errors[field] && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors[field]}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {elevesDisponibles.length === 0 && (
                    <p className="text-sm text-slate-500">
                        Les délégués pourront être choisis après l’ajout des
                        élèves à la classe.
                    </p>
                )}

                <div>
                    <label
                        htmlFor="observations"
                        className="mb-2 block font-semibold"
                    >
                        Observations sur la classe
                    </label>
                    <textarea
                        id="observations"
                        rows="3"
                        maxLength="2000"
                        value={data.observations || ""}
                        onChange={(event) =>
                            setData("observations", event.target.value)
                        }
                        className="w-full rounded-lg border p-3"
                        placeholder="Informations complémentaires sur l’organisation ou le suivi de la classe"
                    />
                    {errors.observations && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.observations}
                        </p>
                    )}
                </div>
            </section>

            {/* ========================================================
                ACTIVE
            ======================================================== */}

            <div
                className="
                flex
                items-center
                gap-3
            "
            >
                <input
                    type="checkbox"
                    id="active"
                    checked={Boolean(data.active)}
                    onChange={(e) => setData("active", e.target.checked)}
                />

                <label htmlFor="active" className="font-semibold">
                    Classe active
                </label>
            </div>

            {/* ========================================================
                BOUTONS
            ======================================================== */}

            <div
                className="
                flex
                justify-end
                gap-4
            "
            >
                <Link
                    href={route("classes.index")}
                    className="
                        border
                        rounded-lg
                        px-6
                        py-3
                    "
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="
                        bg-blue-600
                        hover:bg-blue-700
                        disabled:opacity-50
                        text-white
                        rounded-lg
                        px-6
                        py-3
                    "
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
