import React from "react";

/*
|--------------------------------------------------------------------------
| CARTE INDICATEUR
|--------------------------------------------------------------------------
*/

function StatCard({
    titre,
    valeur,
    description,
    icone,
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {titre}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {valeur}
                    </p>

                    {description && (
                        <p className="mt-1 text-xs text-gray-500">
                            {description}
                        </p>
                    )}
                </div>

                {icone && (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                        {icone}
                    </div>
                )}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| BARRE DE PROGRESSION
|--------------------------------------------------------------------------
*/

function BarreStatistique({
    libelle,
    total,
    maximum,
    pourcentage,
}) {
    const largeur =
        maximum > 0
            ? Math.max(
                  2,
                  Math.round((total / maximum) * 100)
              )
            : 0;

    return (
        <div className="mb-4">
            <div className="mb-1 flex items-center justify-between gap-4">
                <span className="truncate text-sm font-medium text-gray-700">
                    {libelle}
                </span>

                <span className="whitespace-nowrap text-sm font-bold text-gray-900">
                    {total}
                    {pourcentage !== undefined &&
                        ` (${pourcentage} %)`}
                </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{
                        width: `${largeur}%`,
                    }}
                />
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| DONUT SVG
|--------------------------------------------------------------------------
*/

function DonutGenre({ genre = [], total = 0 }) {

    const masculin =
        genre.find(
            (item) =>
                item.libelle === "Masculin"
        )?.total ?? 0;

    const feminin =
        genre.find(
            (item) =>
                item.libelle === "Féminin"
        )?.total ?? 0;

    const nonRenseigne =
        genre.find(
            (item) =>
                item.libelle ===
                "Non renseigné"
        )?.total ?? 0;

    const rayon = 52;

    const circonference =
        2 * Math.PI * rayon;

    const masculinPct =
        total > 0
            ? masculin / total
            : 0;

    const femininPct =
        total > 0
            ? feminin / total
            : 0;

    const nonRenseignePct =
        total > 0
            ? nonRenseigne / total
            : 0;

    const masculinDash =
        masculinPct * circonference;

    const femininDash =
        femininPct * circonference;

    const nonRenseigneDash =
        nonRenseignePct * circonference;

    const masculinPctAffiche =
        total > 0
            ? ((masculin / total) * 100).toFixed(1)
            : "0.0";

    const femininPctAffiche =
        total > 0
            ? ((feminin / total) * 100).toFixed(1)
            : "0.0";

    const nonRenseignePctAffiche =
        total > 0
            ? (
                  (nonRenseigne /
                      total) *
                  100
              ).toFixed(1)
            : "0.0";

    return (
        <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="relative h-48 w-48 shrink-0">
                <svg
                    viewBox="0 0 140 140"
                    className="h-full w-full -rotate-90"
                >
                    {/* Fond */}
                    <circle
                        cx="70"
                        cy="70"
                        r={rayon}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="18"
                    />

                    {/* Masculin */}
                    {masculin > 0 && (
                        <circle
                            cx="70"
                            cy="70"
                            r={rayon}
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="18"
                            strokeDasharray={`${masculinDash} ${circonference}`}
                            strokeDashoffset="0"
                            strokeLinecap="butt"
                        />
                    )}

                    {/* Féminin */}
                    {feminin > 0 && (
                        <circle
                            cx="70"
                            cy="70"
                            r={rayon}
                            fill="none"
                            stroke="#ec4899"
                            strokeWidth="18"
                            strokeDasharray={`${femininDash} ${circonference}`}
                            strokeDashoffset={`-${masculinDash}`}
                            strokeLinecap="butt"
                        />
                    )}

                    {/* Non renseigné */}
                    {nonRenseigne > 0 && (
                        <circle
                            cx="70"
                            cy="70"
                            r={rayon}
                            fill="none"
                            stroke="#9ca3af"
                            strokeWidth="18"
                            strokeDasharray={`${nonRenseigneDash} ${circonference}`}
                            strokeDashoffset={`-${
                                masculinDash +
                                femininDash
                            }`}
                            strokeLinecap="butt"
                        />
                    )}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                        {total}
                    </span>

                    <span className="text-xs text-gray-500">
                        enseignants
                    </span>
                </div>
            </div>

            <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-blue-600" />

                        <span className="text-sm text-gray-700">
                            Masculin
                        </span>
                    </div>

                    <span className="font-semibold">
                        {masculin} ({masculinPctAffiche} %)
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-pink-500" />

                        <span className="text-sm text-gray-700">
                            Féminin
                        </span>
                    </div>

                    <span className="font-semibold">
                        {feminin} ({femininPctAffiche} %)
                    </span>
                </div>

                {nonRenseigne > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-gray-400" />

                            <span className="text-sm text-gray-700">
                                Non renseigné
                            </span>
                        </div>

                        <span className="font-semibold">
                            {nonRenseigne} (
                            {nonRenseignePctAffiche} %)
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| SECTION GRAPHIQUE
|--------------------------------------------------------------------------
*/

function SectionGraphique({
    titre,
    description,
    children,
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                    {titre}
                </h3>

                {description && (
                    <p className="mt-1 text-sm text-gray-500">
                        {description}
                    </p>
                )}
            </div>

            {children}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| COMPOSANT PRINCIPAL
|--------------------------------------------------------------------------
*/

export default function StatistiquesEnseignants({
    statistiques,
}) {
    if (!statistiques) {
        return null;
    }

    const {
        total = 0,
        actifs = 0,
        inactifs = 0,
        avec_matricule_fp = 0,
        sans_matricule_fp = 0,
        volume_horaire_total = 0,
        volume_horaire_moyen = 0,
        age_moyen = 0,
        anciennete_moyenne = 0,
        genre = [],
        types = [],
        statuts = [],
        matieres = [],
        diplomes = [],
    } = statistiques;

    const maximumTypes =
        Math.max(
            ...types.map(
                (item) => item.total
            ),
            1
        );

    const maximumStatuts =
        Math.max(
            ...statuts.map(
                (item) => item.total
            ),
            1
        );

    const maximumMatieres =
        Math.max(
            ...matieres.map(
                (item) => item.total
            ),
            1
        );

    const maximumDiplomes =
        Math.max(
            ...diplomes.map(
                (item) => item.total
            ),
            1
        );

    return (
        <div className="mt-10 space-y-6">

            {/* TITRE */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Statistiques des enseignants
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Vue synthétique de la composition et de la situation du personnel enseignant.
                </p>
            </div>

            {/* INDICATEURS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <StatCard
                    titre="Total enseignants"
                    valeur={total}
                    description="Personnel enregistré"
                    icone="👥"
                />

                <StatCard
                    titre="Enseignants actifs"
                    valeur={actifs}
                    description={
                        total > 0
                            ? `${(
                                  (actifs /
                                      total) *
                                  100
                              ).toFixed(1)} % du personnel`
                            : "0 %"
                    }
                    icone="✓"
                />

                <StatCard
                    titre="Matricule fonction publique"
                    valeur={avec_matricule_fp}
                    description={`${sans_matricule_fp} sans matricule`}
                    icone="🪪"
                />

                <StatCard
                    titre="Volume horaire"
                    valeur={`${volume_horaire_total} h`}
                    description={`Moyenne : ${volume_horaire_moyen} h`}
                    icone="⏱"
                />
            </div>

            {/* GENRE + TYPES */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                <SectionGraphique
                    titre="Répartition par genre"
                    description="Répartition du personnel enseignant selon le sexe."
                >
                    <DonutGenre
                        genre={genre}
                        total={total}
                    />
                </SectionGraphique>

                <SectionGraphique
                    titre="Types d'enseignants"
                    description="Répartition entre permanents, vacataires et contractuels."
                >
                    {types.length > 0 ? (
                        types.map((item) => (
                            <BarreStatistique
                                key={item.libelle}
                                libelle={item.libelle}
                                total={item.total}
                                maximum={maximumTypes}
                                pourcentage={item.pourcentage}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">
                            Aucune donnée disponible.
                        </p>
                    )}
                </SectionGraphique>
            </div>

            {/* MATIÈRES */}
            <SectionGraphique
                titre="Répartition par matière principale"
                description="Nombre d'enseignants par matière principale."
            >
                {matieres.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
                        {matieres.map(
                            (item) => (
                                <BarreStatistique
                                    key={
                                        item.libelle
                                    }
                                    libelle={
                                        item.libelle
                                    }
                                    total={
                                        item.total
                                    }
                                    maximum={
                                        maximumMatieres
                                    }
                                />
                            )
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">
                        Aucune matière principale renseignée.
                    </p>
                )}
            </SectionGraphique>

            {/* STATUTS + DIPLÔMES */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                <SectionGraphique
                    titre="Répartition par statut"
                    description="Situation administrative des enseignants."
                >
                    {statuts.length > 0 ? (
                        statuts.map(
                            (item) => (
                                <BarreStatistique
                                    key={
                                        item.libelle
                                    }
                                    libelle={
                                        item.libelle
                                    }
                                    total={
                                        item.total
                                    }
                                    maximum={
                                        maximumStatuts
                                    }
                                    pourcentage={
                                        item.pourcentage
                                    }
                                />
                            )
                        )
                    ) : (
                        <p className="text-sm text-gray-500">
                            Aucune donnée disponible.
                        </p>
                    )}

                    <div className="mt-5 border-t pt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                Enseignants inactifs
                            </span>

                            <span className="font-bold text-gray-900">
                                {inactifs}
                            </span>
                        </div>
                    </div>
                </SectionGraphique>

                <SectionGraphique
                    titre="Niveau de qualification"
                    description="Répartition des enseignants selon le diplôme renseigné."
                >
                    {diplomes.length > 0 ? (
                        diplomes.map(
                            (item) => (
                                <BarreStatistique
                                    key={
                                        item.libelle
                                    }
                                    libelle={
                                        item.libelle
                                    }
                                    total={
                                        item.total
                                    }
                                    maximum={
                                        maximumDiplomes
                                    }
                                />
                            )
                        )
                    ) : (
                        <p className="text-sm text-gray-500">
                            Aucun diplôme renseigné.
                        </p>
                    )}
                </SectionGraphique>
            </div>

            {/* INDICATEURS RH */}
            <SectionGraphique
                titre="Indicateurs complémentaires"
                description="Quelques indicateurs utiles au pilotage du personnel."
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                            Âge moyen
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {age_moyen > 0
                                ? `${age_moyen} ans`
                                : "—"}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                            Ancienneté moyenne
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {anciennete_moyenne > 0
                                ? `${anciennete_moyenne} ans`
                                : "—"}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                            Avec matricule FP
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {avec_matricule_fp}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                            Sans matricule FP
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {sans_matricule_fp}
                        </p>
                    </div>
                </div>
            </SectionGraphique>
        </div>
    );
}