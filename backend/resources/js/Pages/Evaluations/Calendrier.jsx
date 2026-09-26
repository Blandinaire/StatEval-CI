import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";

const MOIS = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
];

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const TRIMESTRES = [
    { value: "1", label: "Trimestre 1", mois: [9, 10, 11] },
    { value: "2", label: "Trimestre 2", mois: [0, 1, 11] },
    { value: "3", label: "Trimestre 3", mois: [2, 3, 4, 5] },
];

function dateLocale(date) {
    if (!date) return "-";

    const [annee, mois, jour] = String(date)
        .slice(0, 10)
        .split("-")
        .map(Number);

    if (!annee || !mois || !jour) return "-";

    return new Date(annee, mois - 1, jour).toLocaleDateString("fr-FR");
}

function dateLocaleCourte(date) {
    if (!date) return "";

    const [annee, mois, jour] = String(date)
        .slice(0, 10)
        .split("-")
        .map(Number);

    return new Date(annee, mois - 1, jour).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
    });
}

function dateLocaleMois(annee, mois) {
    return new Date(annee, mois, 1).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
    });
}

function cleDate(date) {
    return String(date ?? "").slice(0, 10);
}

function obtenirMois(date) {
    const valeur = cleDate(date);
    const [annee, mois] = valeur.split("-").map(Number);

    return {
        annee,
        mois: mois - 1,
    };
}

function obtenirJoursDuMois(annee, mois) {
    const premierJour = new Date(annee, mois, 1);
    const decalage = (premierJour.getDay() + 6) % 7;
    const nombreJours = new Date(annee, mois + 1, 0).getDate();

    const jours = [];

    for (let i = 0; i < decalage; i++) {
        jours.push(null);
    }

    for (let jour = 1; jour <= nombreJours; jour++) {
        jours.push(jour);
    }

    while (jours.length % 7 !== 0) {
        jours.push(null);
    }

    return jours;
}

function CalendrierMois({
    annee,
    mois,
    evaluationsParDate,
    onSelectionner,
    dateSelectionnee,
}) {
    const jours = obtenirJoursDuMois(annee, mois);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="grid grid-cols-7 border-b bg-gray-50">
                {JOURS.map((jour) => (
                    <div
                        key={jour}
                        className="py-3 text-center text-xs font-semibold text-gray-500"
                    >
                        {jour}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {jours.map((jour, index) => {
                    if (!jour) {
                        return (
                            <div
                                key={`vide-${index}`}
                                className="min-h-24 border-b border-r bg-gray-50/50 sm:min-h-32"
                            />
                        );
                    }

                    const date = [
                        annee,
                        String(mois + 1).padStart(2, "0"),
                        String(jour).padStart(2, "0"),
                    ].join("-");

                    const evenements = evaluationsParDate[date] ?? [];
                    const selectionne = dateSelectionnee === date;

                    return (
                        <button
                            type="button"
                            key={date}
                            onClick={() => onSelectionner(date)}
                            className={`min-h-24 border-b border-r p-1 text-left transition hover:bg-blue-50 sm:min-h-32 sm:p-2 ${
                                selectionne
                                    ? "bg-blue-50 ring-2 ring-inset ring-blue-500"
                                    : "bg-white"
                            }`}
                        >
                            <div
                                className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                                    selectionne
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-700"
                                }`}
                            >
                                {jour}
                            </div>

                            <div className="space-y-1">
                                {evenements.slice(0, 2).map((item) => (
                                    <div
                                        key={item.id}
                                        className="truncate rounded bg-blue-100 px-1 py-1 text-[10px] font-medium text-blue-800 sm:text-xs"
                                        title={item.libelle}
                                    >
                                        {item.libelle}
                                    </div>
                                ))}

                                {evenements.length > 2 && (
                                    <div className="text-[10px] font-medium text-gray-500">
                                        +{evenements.length - 2} autre(s)
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function CarteEvaluation({ item }) {
    return (
        <Link
            href={route("evaluations.programmation", item.id)}
            className="block rounded-xl border border-gray-200 border-l-4 border-l-blue-600 bg-white p-4 shadow-sm transition hover:bg-blue-50"
        >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                        {item.libelle}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        {item.niveau?.libelle ?? "Niveau non précisé"}
                        {" · "}
                        {item.matiere?.libelle ?? "Matière non précisée"}
                        {" · "}
                        {item.classes?.length ?? 0} classe(s)
                    </p>

                    {item.statut && (
                        <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                            {item.statut}
                        </span>
                    )}
                </div>

                <div className="shrink-0 text-sm font-semibold text-blue-700">
                    {dateLocale(item.date_evaluation)}
                </div>
            </div>
        </Link>
    );
}

export default function Calendrier({
    evaluations = [],
    annees = [],
    anneeScolaireActiveId = null,
}) {
    const aujourdHui = new Date();

    const [vue, setVue] = useState("mois");
    const [anneeId, setAnneeId] = useState(
        String(anneeScolaireActiveId ?? annees[0]?.id ?? ""),
    );

    const anneeInitiale = obtenirMois(
        `${aujourdHui.getFullYear()}-${String(
            aujourdHui.getMonth() + 1,
        ).padStart(2, "0")}-01`,
    );

    const [anneeCalendrier, setAnneeCalendrier] = useState(anneeInitiale.annee);
    const [mois, setMois] = useState(anneeInitiale.mois);
    const [trimestre, setTrimestre] = useState("1");
    const [dateSelectionnee, setDateSelectionnee] = useState(null);

    const anneeSelectionnee = annees.find(
        (item) => String(item.id) === String(anneeId),
    );

    const evaluationsAnnee = useMemo(() => {
        return evaluations.filter((item) => {
            if (!anneeId) return true;

            return String(item.annee_scolaire_id) === String(anneeId);
        });
    }, [evaluations, anneeId]);

    const evaluationsParDate = useMemo(() => {
        return evaluationsAnnee.reduce((acc, item) => {
            const date = cleDate(item.date_evaluation);

            if (!date) return acc;

            if (!acc[date]) acc[date] = [];

            acc[date].push(item);

            return acc;
        }, {});
    }, [evaluationsAnnee]);

    const evaluationsMois = useMemo(() => {
        return evaluationsAnnee.filter((item) => {
            const date = cleDate(item.date_evaluation);

            return date.startsWith(
                `${anneeCalendrier}-${String(mois + 1).padStart(2, "0")}`,
            );
        });
    }, [evaluationsAnnee, anneeCalendrier, mois]);

    const evaluationsTrimestre = useMemo(() => {
        const configuration = TRIMESTRES.find(
            (item) => item.value === trimestre,
        );

        if (!configuration) return [];

        return evaluationsAnnee.filter((item) => {
            const { mois: moisEvaluation } = obtenirMois(item.date_evaluation);

            return configuration.mois.includes(moisEvaluation);
        });
    }, [evaluationsAnnee, trimestre]);

    const evaluationsAnnuelles = useMemo(() => {
        return [...evaluationsAnnee].sort((a, b) =>
            cleDate(a.date_evaluation).localeCompare(
                cleDate(b.date_evaluation),
            ),
        );
    }, [evaluationsAnnee]);

    const evaluationsJourSelectionne = useMemo(() => {
        if (!dateSelectionnee) return [];

        return evaluationsParDate[dateSelectionnee] ?? [];
    }, [evaluationsParDate, dateSelectionnee]);

    function changerMois(direction) {
        const nouvelleDate = new Date(anneeCalendrier, mois + direction, 1);

        setAnneeCalendrier(nouvelleDate.getFullYear());
        setMois(nouvelleDate.getMonth());
        setDateSelectionnee(null);
    }

    function revenirAujourdhui() {
        const maintenant = new Date();

        setAnneeCalendrier(maintenant.getFullYear());
        setMois(maintenant.getMonth());
        setDateSelectionnee(null);
    }

    function changerAnneeScolaire(valeur) {
        setAnneeId(valeur);
        setDateSelectionnee(null);

        const annee = annees.find((item) => String(item.id) === String(valeur));

        if (annee?.date_debut) {
            const debut = obtenirMois(annee.date_debut);

            setAnneeCalendrier(debut.annee);
            setMois(debut.mois);
        }
    }

    const titrePeriode =
        vue === "mois"
            ? dateLocaleMois(anneeCalendrier, mois)
            : vue === "trimestre"
              ? TRIMESTRES.find((item) => item.value === trimestre)?.label
              : (anneeSelectionnee?.libelle ?? "Année scolaire");

    return (
        <AdminLayout>
            <Head title="Calendrier des évaluations" />

            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Calendrier des évaluations
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Planification et suivi des évaluations
                            administratives.
                        </p>
                    </div>

                    <Link
                        href={route("evaluations.programmations")}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Suivi des programmations
                    </Link>
                </div>

                {/* Filtres */}
                <div className="grid grid-cols-1 gap-4 rounded-xl border bg-white p-5 shadow-sm md:grid-cols-3">
                    <div>
                        <label
                            htmlFor="vue-calendrier"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Vue du calendrier
                        </label>

                        <select
                            id="vue-calendrier"
                            value={vue}
                            onChange={(e) => {
                                setVue(e.target.value);
                                setDateSelectionnee(null);
                            }}
                            className="w-full rounded-lg border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="mois">Mensuelle</option>
                            <option value="trimestre">Trimestrielle</option>
                            <option value="annee">Annuelle</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="annee-scolaire"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Année scolaire
                        </label>

                        <select
                            id="annee-scolaire"
                            value={anneeId}
                            onChange={(e) =>
                                changerAnneeScolaire(e.target.value)
                            }
                            className="w-full rounded-lg border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500"
                        >
                            {annees.map((annee) => (
                                <option key={annee.id} value={annee.id}>
                                    {annee.libelle}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="periode-calendrier"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            {vue === "mois"
                                ? "Mois"
                                : vue === "trimestre"
                                  ? "Trimestre"
                                  : "Période annuelle"}
                        </label>

                        {vue === "mois" ? (
                            <select
                                id="periode-calendrier"
                                value={mois}
                                onChange={(e) => {
                                    setMois(Number(e.target.value));
                                    setDateSelectionnee(null);
                                }}
                                className="w-full rounded-lg border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500"
                            >
                                {MOIS.map((nom, index) => (
                                    <option key={nom} value={index}>
                                        {nom}
                                    </option>
                                ))}
                            </select>
                        ) : vue === "trimestre" ? (
                            <select
                                id="periode-calendrier"
                                value={trimestre}
                                onChange={(e) => setTrimestre(e.target.value)}
                                className="w-full rounded-lg border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500"
                            >
                                {TRIMESTRES.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                                Toute l’année scolaire
                            </div>
                        )}
                    </div>
                </div>

                {/* En-tête de période */}
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold capitalize text-gray-800">
                            {titrePeriode}
                        </h2>

                        <p className="text-sm text-gray-500">
                            {vue === "mois"
                                ? `${evaluationsMois.length} évaluation(s)`
                                : vue === "trimestre"
                                  ? `${evaluationsTrimestre.length} évaluation(s)`
                                  : `${evaluationsAnnuelles.length} évaluation(s)`}
                        </p>
                    </div>

                    {vue === "mois" && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => changerMois(-1)}
                                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
                            >
                                ← Précédent
                            </button>

                            <button
                                type="button"
                                onClick={revenirAujourdhui}
                                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
                            >
                                Aujourd’hui
                            </button>

                            <button
                                type="button"
                                onClick={() => changerMois(1)}
                                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
                            >
                                Suivant →
                            </button>
                        </div>
                    )}
                </div>

                {/* Vue mensuelle */}
                {vue === "mois" && (
                    <CalendrierMois
                        annee={anneeCalendrier}
                        mois={mois}
                        evaluationsParDate={evaluationsParDate}
                        dateSelectionnee={dateSelectionnee}
                        onSelectionner={setDateSelectionnee}
                    />
                )}

                {/* Vue trimestrielle */}
                {vue === "trimestre" && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {TRIMESTRES.map((item) => (
                            <button
                                type="button"
                                key={item.value}
                                onClick={() => setTrimestre(item.value)}
                                className={`rounded-xl border p-5 text-left transition ${
                                    trimestre === item.value
                                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                        : "border-gray-200 bg-white hover:bg-gray-50"
                                }`}
                            >
                                <h3 className="font-semibold text-gray-800">
                                    {item.label}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {item.mois.map((m) => MOIS[m]).join(", ")}
                                </p>

                                <p className="mt-3 text-2xl font-bold text-blue-700">
                                    {
                                        evaluationsAnnee.filter((evaluation) =>
                                            item.mois.includes(
                                                obtenirMois(
                                                    evaluation.date_evaluation,
                                                ).mois,
                                            ),
                                        ).length
                                    }
                                </p>

                                <p className="text-sm text-gray-500">
                                    évaluation(s)
                                </p>
                            </button>
                        ))}
                    </div>
                )}

                {/* Vue annuelle : 12 mini-calendriers */}
                {vue === "annee" && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {MOIS.map((nom, index) => {
                            const nombre = evaluationsAnnuelles.filter(
                                (item) =>
                                    obtenirMois(item.date_evaluation).mois ===
                                    index,
                            ).length;

                            return (
                                <button
                                    type="button"
                                    key={nom}
                                    onClick={() => {
                                        setMois(index);
                                        setVue("mois");
                                        setDateSelectionnee(null);
                                    }}
                                    className="rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-blue-400 hover:bg-blue-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold capitalize text-gray-800">
                                            {nom}
                                        </h3>

                                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                                            {nombre}
                                        </span>
                                    </div>

                                    <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                                        {JOURS.map((jour) => (
                                            <span
                                                key={jour}
                                                className="text-[10px] font-medium text-gray-400"
                                            >
                                                {jour.slice(0, 1)}
                                            </span>
                                        ))}

                                        {obtenirJoursDuMois(
                                            anneeCalendrier,
                                            index,
                                        ).map((jour, i) => (
                                            <span
                                                key={`${nom}-${i}`}
                                                className={`flex h-6 items-center justify-center rounded text-[10px] ${
                                                    jour
                                                        ? "text-gray-700"
                                                        : "text-transparent"
                                                }`}
                                            >
                                                {jour ?? "·"}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Détails du jour sélectionné */}
                {vue === "mois" && dateSelectionnee && (
                    <section className="space-y-3">
                        <h3 className="text-xl font-bold text-gray-800">
                            Évaluations du {dateLocale(dateSelectionnee)}
                        </h3>

                        {evaluationsJourSelectionne.length > 0 ? (
                            evaluationsJourSelectionne.map((item) => (
                                <CarteEvaluation key={item.id} item={item} />
                            ))
                        ) : (
                            <div className="rounded-xl border bg-white p-6 text-center text-gray-500">
                                Aucune évaluation à cette date.
                            </div>
                        )}
                    </section>
                )}

                {/* Liste des évaluations selon la vue */}
                {vue !== "mois" && (
                    <section className="space-y-3">
                        <h3 className="text-xl font-bold text-gray-800">
                            Liste des évaluations
                        </h3>

                        {(vue === "trimestre"
                            ? evaluationsTrimestre
                            : evaluationsAnnuelles
                        ).length > 0 ? (
                            (vue === "trimestre"
                                ? evaluationsTrimestre
                                : evaluationsAnnuelles
                            ).map((item) => (
                                <CarteEvaluation key={item.id} item={item} />
                            ))
                        ) : (
                            <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
                                Aucune évaluation pour cette période.
                            </div>
                        )}
                    </section>
                )}

                {vue === "mois" &&
                    !dateSelectionnee &&
                    evaluationsMois.length > 0 && (
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold text-gray-800">
                                Évaluations du mois
                            </h3>

                            {evaluationsMois.map((item) => (
                                <CarteEvaluation key={item.id} item={item} />
                            ))}
                        </section>
                    )}
            </div>
        </AdminLayout>
    );
}
