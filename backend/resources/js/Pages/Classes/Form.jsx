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

    const maquettesAnneeEtablissement = maquettesListe.filter((maquette) => {
        if (
            String(maquette.annee_scolaire_id) !==
            String(data.annee_scolaire_id)
        ) {
            return false;
        }

        return Boolean(maquette.active);
    });

    /*
    |--------------------------------------------------------------------------
    | NIVEAUX DISPONIBLES
    |--------------------------------------------------------------------------
    */

    const niveauxDisponibles = niveauxListe.filter((niveau) => {
        return maquettesAnneeEtablissement.some(
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

    const maquettesDisponibles = maquettesAnneeEtablissement.filter(
        (maquette) => {
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
        },
    );

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
                            {maquette.libelle}
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
