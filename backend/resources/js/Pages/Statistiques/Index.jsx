import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    BarChart3,
    BookOpen,
    CheckCircle2,
    GraduationCap,
    Medal,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
    AlertCircle,
    FileText,
    Target,
} from "lucide-react";
import { useMemo, useState } from "react";

export default function Index({
    filtres = {},
    etablissements = [],
    annees = [],
    classes = [],
    matieres = [],
    statistiques = {},
    repartition = [],
    resultatsParMatiere = [],
    resultatsParClasse = [],
    distributionNotes = [],
}) {
    const [filters, setFilters] = useState({
        etablissement_id: filtres.etablissement_id || "",
        annee_scolaire_id: filtres.annee_scolaire_id || "",
        classe_id: filtres.classe_id || "",
        matiere_id: filtres.matiere_id || "",
    });

    /*
    |--------------------------------------------------------------------------
    | Classes filtrées selon établissement / année scolaire
    |--------------------------------------------------------------------------
    */

    const classesFiltrees = useMemo(() => {
        return classes.filter((classe) => {
            if (
                filters.etablissement_id &&
                String(classe.etablissement_id) !==
                    String(filters.etablissement_id)
            ) {
                return false;
            }

            if (
                filters.annee_scolaire_id &&
                String(classe.annee_scolaire_id) !==
                    String(filters.annee_scolaire_id)
            ) {
                return false;
            }

            return true;
        });
    }, [classes, filters.etablissement_id, filters.annee_scolaire_id]);

    /*
    |--------------------------------------------------------------------------
    | Application des filtres
    |--------------------------------------------------------------------------
    */

    const appliquerFiltres = () => {
        router.get(route("statistiques.index"), filters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Réinitialisation
    |--------------------------------------------------------------------------
    */

    const reinitialiserFiltres = () => {
        const nouveauxFiltres = {
            etablissement_id: "",
            annee_scolaire_id: "",
            classe_id: "",
            matiere_id: "",
        };

        setFilters(nouveauxFiltres);

        router.get(
            route("statistiques.index"),
            {},
            {
                preserveState: false,
                preserveScroll: false,
                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Formatage
    |--------------------------------------------------------------------------
    */

    const formatNote = (value) => {
        if (value === null || value === undefined || value === "") {
            return "—";
        }

        return Number(value).toFixed(2);
    };

    const formatPourcentage = (value) => {
        if (value === null || value === undefined) {
            return "0.0";
        }

        return Number(value).toFixed(1);
    };

    /*
    |--------------------------------------------------------------------------
    | Couleurs des appréciations
    |--------------------------------------------------------------------------
    */

    const appreciationClasses = {
        Excellent: "bg-emerald-100 text-emerald-700",

        "Très bien": "bg-green-100 text-green-700",

        Bien: "bg-blue-100 text-blue-700",

        "Assez bien": "bg-cyan-100 text-cyan-700",

        Moyen: "bg-yellow-100 text-yellow-700",

        Passable: "bg-orange-100 text-orange-700",

        Insuffisant: "bg-red-100 text-red-700",

        "Très insuffisant": "bg-rose-100 text-rose-700",

        Faible: "bg-slate-200 text-slate-700",
    };

    return (
        <AdminLayout>
            <Head title="Statistiques" />
            <div className="space-y-6">
                {/* =====================================================
                    EN-TÊTE
                ====================================================== */}

                <section className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <BarChart3 size={25} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Statistiques
                            </h1>

                            <p className="text-sm text-slate-500">
                                Analyse globale des résultats scolaires
                            </p>
                        </div>
                    </div>

                    {/* =================================================
                        FILTRES
                    ================================================== */}

                    <div className="mt-6 rounded-xl bg-slate-50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Target size={18} className="text-blue-600" />

                            <h2 className="font-semibold text-slate-700">
                                Filtres d'analyse
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {/* Établissement */}

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Établissement
                                </label>

                                <select
                                    value={filters.etablissement_id}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            etablissement_id: e.target.value,
                                            classe_id: "",
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        Tous les établissements
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

                            {/* Année */}

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Année scolaire
                                </label>

                                <select
                                    value={filters.annee_scolaire_id}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            annee_scolaire_id: e.target.value,
                                            classe_id: "",
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">Toutes les années</option>

                                    {annees.map((annee) => (
                                        <option key={annee.id} value={annee.id}>
                                            {annee.libelle}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Classe */}

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Classe
                                </label>

                                <select
                                    value={filters.classe_id}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            classe_id: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">Toutes les classes</option>

                                    {classesFiltrees.map((classe) => (
                                        <option
                                            key={classe.id}
                                            value={classe.id}
                                        >
                                            {classe.libelle}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Matière */}

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Matière
                                </label>

                                <select
                                    value={filters.matiere_id}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            matiere_id: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        Toutes les matières
                                    </option>

                                    {matieres.map((matiere) => (
                                        <option
                                            key={matiere.id}
                                            value={matiere.id}
                                        >
                                            {matiere.libelle}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={reinitialiserFiltres}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Réinitialiser
                            </button>

                            <button
                                type="button"
                                onClick={appliquerFiltres}
                                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Appliquer les filtres
                            </button>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    CARTES PRINCIPALES
                ====================================================== */}

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Évaluations"
                        value={statistiques.evaluations ?? 0}
                        subtitle="Évaluations enregistrées"
                        icon={FileText}
                        iconClass="bg-blue-100 text-blue-600"
                    />

                    <StatCard
                        title="Élèves"
                        value={statistiques.eleves ?? 0}
                        subtitle="Élèves concernés"
                        icon={Users}
                        iconClass="bg-purple-100 text-purple-600"
                    />

                    <StatCard
                        title="Notes saisies"
                        value={statistiques.notes_saisies ?? 0}
                        subtitle="Notes enregistrées"
                        icon={BookOpen}
                        iconClass="bg-indigo-100 text-indigo-600"
                    />

                    <StatCard
                        title="Moyenne générale"
                        value={
                            statistiques.moyenne_generale !== null &&
                            statistiques.moyenne_generale !== undefined
                                ? `${formatNote(
                                      statistiques.moyenne_generale,
                                  )} /20`
                                : "—"
                        }
                        subtitle="Toutes évaluations confondues"
                        icon={TrendingUp}
                        iconClass="bg-emerald-100 text-emerald-600"
                    />
                </section>

                {/* =====================================================
                    DEUXIÈME LIGNE
                ====================================================== */}

                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatCard
                        title="Meilleure note"
                        value={
                            statistiques.meilleure_note !== null &&
                            statistiques.meilleure_note !== undefined
                                ? `${formatNote(
                                      statistiques.meilleure_note,
                                  )} /20`
                                : "—"
                        }
                        subtitle="Meilleur résultat enregistré"
                        icon={Medal}
                        iconClass="bg-yellow-100 text-yellow-600"
                        valueClass="text-emerald-600"
                    />

                    <StatCard
                        title="Note la plus faible"
                        value={
                            statistiques.plus_faible_note !== null &&
                            statistiques.plus_faible_note !== undefined
                                ? `${formatNote(
                                      statistiques.plus_faible_note,
                                  )} /20`
                                : "—"
                        }
                        subtitle="Résultat le plus faible"
                        icon={TrendingDown}
                        iconClass="bg-red-100 text-red-600"
                        valueClass="text-red-600"
                    />

                    <StatCard
                        title="Médiane"
                        value={
                            statistiques.mediane !== null &&
                            statistiques.mediane !== undefined
                                ? `${formatNote(statistiques.mediane)} /20`
                                : "—"
                        }
                        subtitle="Médiane des résultats"
                        icon={BarChart3}
                        iconClass="bg-cyan-100 text-cyan-600"
                    />
                </section>

                {/* =====================================================
                    PERFORMANCE
                ====================================================== */}

                <section className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-800">
                            Performance scolaire
                        </h2>

                        <p className="text-sm text-slate-500">
                            Synthèse des résultats enregistrés
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <PerformanceCard
                            title="Taux de réussite"
                            value={`${formatPourcentage(
                                statistiques.taux_reussite,
                            )} %`}
                            subtitle={`${
                                statistiques.reussites ?? 0
                            } réussites`}
                            icon={CheckCircle2}
                            className="bg-emerald-50 text-emerald-700"
                        />

                        <PerformanceCard
                            title="Taux d'échec"
                            value={`${formatPourcentage(
                                statistiques.taux_echec,
                            )} %`}
                            subtitle={`${statistiques.echecs ?? 0} échecs`}
                            icon={XCircle}
                            className="bg-red-50 text-red-700"
                        />

                        <PerformanceCard
                            title="Absents"
                            value={statistiques.absents ?? 0}
                            subtitle={`${formatPourcentage(
                                statistiques.taux_absence,
                            )} %`}
                            icon={AlertCircle}
                            className="bg-orange-50 text-orange-700"
                        />

                        <PerformanceCard
                            title="Non notés"
                            value={statistiques.non_notes ?? 0}
                            subtitle="Élèves sans note"
                            icon={GraduationCap}
                            className="bg-slate-100 text-slate-700"
                        />
                    </div>
                </section>

                {/* =====================================================
                    RÉSULTATS PAR MATIÈRE
                ====================================================== */}

                <section className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
                    <div className="border-b border-slate-200 p-5">
                        <h2 className="text-lg font-bold text-slate-800">
                            Résultats par matière
                        </h2>

                        <p className="text-sm text-slate-500">
                            Comparaison des performances par discipline
                        </p>
                    </div>

                    {resultatsParMatiere.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Matière</th>

                                        <th className="px-5 py-3">Notes</th>

                                        <th className="px-5 py-3">Moyenne</th>

                                        <th className="px-5 py-3">Meilleure</th>

                                        <th className="px-5 py-3">
                                            Plus faible
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {resultatsParMatiere.map(
                                        (resultat, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4 font-medium text-slate-800">
                                                    {resultat.matiere}
                                                </td>

                                                <td className="px-5 py-4 text-slate-600">
                                                    {resultat.nombre}
                                                </td>

                                                <td className="px-5 py-4 font-semibold text-blue-600">
                                                    {formatNote(
                                                        resultat.moyenne,
                                                    )}{" "}
                                                    /20
                                                </td>

                                                <td className="px-5 py-4 font-semibold text-emerald-600">
                                                    {formatNote(
                                                        resultat.meilleure,
                                                    )}{" "}
                                                    /20
                                                </td>

                                                <td className="px-5 py-4 font-semibold text-red-600">
                                                    {formatNote(
                                                        resultat.plus_faible,
                                                    )}{" "}
                                                    /20
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* =====================================================
                    RÉSULTATS PAR CLASSE
                ====================================================== */}

                <section className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
                    <div className="border-b border-slate-200 p-5">
                        <h2 className="text-lg font-bold text-slate-800">
                            Résultats par classe
                        </h2>

                        <p className="text-sm text-slate-500">
                            Comparaison des performances des classes
                        </p>
                    </div>

                    {resultatsParClasse.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Classe</th>

                                        <th className="px-5 py-3">Notes</th>

                                        <th className="px-5 py-3">Moyenne</th>

                                        <th className="px-5 py-3">
                                            Taux de réussite
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {resultatsParClasse.map(
                                        (resultat, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4 font-semibold text-slate-800">
                                                    {resultat.classe}
                                                </td>

                                                <td className="px-5 py-4 text-slate-600">
                                                    {resultat.nombre}
                                                </td>

                                                <td className="px-5 py-4 font-semibold text-blue-600">
                                                    {formatNote(
                                                        resultat.moyenne,
                                                    )}{" "}
                                                    /20
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                            resultat.taux_reussite >=
                                                            50
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                    >
                                                        {formatPourcentage(
                                                            resultat.taux_reussite,
                                                        )}{" "}
                                                        %
                                                    </span>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* =====================================================
    GRAPHIQUES DES PERFORMANCES
====================================================== */}

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {/* =================================================
        MOYENNE PAR MATIÈRE
    ================================================== */}

                    <section className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-slate-800">
                                Moyenne par matière
                            </h2>

                            <p className="text-sm text-slate-500">
                                Comparaison des moyennes obtenues dans chaque
                                discipline
                            </p>
                        </div>

                        {resultatsParMatiere.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="space-y-5">
                                {resultatsParMatiere.map((resultat, index) => {
                                    const moyenne = Number(
                                        resultat.moyenne || 0,
                                    );

                                    const pourcentage = Math.min(
                                        Math.max((moyenne / 20) * 100, 0),
                                        100,
                                    );

                                    return (
                                        <div key={index}>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {resultat.matiere}
                                                </span>

                                                <span className="text-sm font-bold text-blue-600">
                                                    {formatNote(
                                                        resultat.moyenne,
                                                    )}{" "}
                                                    /20
                                                </span>
                                            </div>

                                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                                    style={{
                                                        width: `${pourcentage}%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="mt-1 flex justify-between text-xs text-slate-400">
                                                <span>
                                                    {resultat.nombre} note
                                                    {resultat.nombre > 1
                                                        ? "s"
                                                        : ""}
                                                </span>

                                                <span>
                                                    {formatPourcentage(
                                                        pourcentage,
                                                    )}{" "}
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* =================================================
        MOYENNE PAR CLASSE
    ================================================== */}

                    <section className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-slate-800">
                                Moyenne par classe
                            </h2>

                            <p className="text-sm text-slate-500">
                                Comparaison des performances moyennes des
                                classes
                            </p>
                        </div>

                        {resultatsParClasse.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="space-y-5">
                                {resultatsParClasse.map((resultat, index) => {
                                    const moyenne = Number(
                                        resultat.moyenne || 0,
                                    );

                                    const pourcentage = Math.min(
                                        Math.max((moyenne / 20) * 100, 0),
                                        100,
                                    );

                                    return (
                                        <div key={index}>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {resultat.classe}
                                                </span>

                                                <span className="text-sm font-bold text-indigo-600">
                                                    {formatNote(
                                                        resultat.moyenne,
                                                    )}{" "}
                                                    /20
                                                </span>
                                            </div>

                                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                                                    style={{
                                                        width: `${pourcentage}%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="mt-1 flex justify-between text-xs text-slate-400">
                                                <span>
                                                    {resultat.nombre} note
                                                    {resultat.nombre > 1
                                                        ? "s"
                                                        : ""}
                                                </span>

                                                <span>
                                                    Réussite :{" "}
                                                    {formatPourcentage(
                                                        resultat.taux_reussite,
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </section>

                {/* =====================================================
    DISTRIBUTION DES NOTES
====================================================== */}

                <section className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Distribution des notes
                            </h2>

                            <p className="text-sm text-slate-500">
                                Répartition des résultats selon les intervalles
                                de notes
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <BarChart3 size={20} />
                        </div>
                    </div>

                    {distributionNotes.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-4">
                            {distributionNotes.map((item, index) => {
                                const pourcentage =
                                    Number(item.pourcentage) || 0;

                                /*
                |--------------------------------------------------------------------------
                | Couleur selon l'intervalle
                |--------------------------------------------------------------------------
                */

                                let couleurBarre = "bg-blue-500";

                                if (index <= 1) {
                                    couleurBarre = "bg-red-400";
                                } else if (index === 2) {
                                    couleurBarre = "bg-orange-400";
                                } else if (index === 3) {
                                    couleurBarre = "bg-yellow-400";
                                } else if (index === 4) {
                                    couleurBarre = "bg-cyan-400";
                                } else if (index === 5) {
                                    couleurBarre = "bg-blue-500";
                                } else if (index === 6) {
                                    couleurBarre = "bg-green-500";
                                } else if (index === 7) {
                                    couleurBarre = "bg-emerald-500";
                                }

                                return (
                                    <div key={index}>
                                        {/* Ligne supérieure */}

                                        <div className="mb-1 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-20 text-sm font-medium text-slate-700">
                                                    {item.intervalle}
                                                </span>

                                                <span className="text-xs text-slate-400">
                                                    {item.nombre}{" "}
                                                    {item.nombre > 1
                                                        ? "notes"
                                                        : "note"}
                                                </span>
                                            </div>

                                            <span className="text-sm font-semibold text-slate-600">
                                                {pourcentage.toFixed(1)} %
                                            </span>
                                        </div>

                                        {/* Barre */}

                                        <div className="h-8 w-full overflow-hidden rounded-lg bg-slate-100">
                                            {pourcentage > 0 && (
                                                <div
                                                    className={`flex h-full items-center rounded-lg px-3 text-xs font-semibold text-white transition-all duration-500 ${couleurBarre}`}
                                                    style={{
                                                        width: `${pourcentage}%`,
                                                        minWidth: "32px",
                                                    }}
                                                >
                                                    {pourcentage >= 8
                                                        ? `${pourcentage.toFixed(1)} %`
                                                        : ""}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* =====================================================
                    RÉPARTITION DES APPRÉCIATIONS
                ====================================================== */}

                <section className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-800">
                            Répartition des appréciations
                        </h2>

                        <p className="text-sm text-slate-500">
                            Distribution des appréciations attribuées
                            automatiquement
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        {repartition.map((item) => (
                            <div
                                key={item.appreciation}
                                className={`rounded-xl p-4 ${
                                    appreciationClasses[item.appreciation] ||
                                    "bg-slate-100 text-slate-700"
                                }`}
                            >
                                <div className="text-xs font-medium">
                                    {item.appreciation}
                                </div>

                                <div className="mt-2 text-2xl font-bold">
                                    {item.nombre}
                                </div>

                                <div className="mt-1 text-xs opacity-70">
                                    {formatPourcentage(item.pourcentage)}%
                                </div>
                            </div>
                        ))}

                        <div className="rounded-xl bg-slate-100 p-4 text-slate-700">
                            <div className="text-xs font-medium">Absent</div>

                            <div className="mt-2 text-2xl font-bold">
                                {statistiques.absents ?? 0}
                            </div>

                            <div className="mt-1 text-xs opacity-70">
                                Élèves absents
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    DISPERSION
                ====================================================== */}

                <section className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Dispersion des résultats
                            </h2>

                            <p className="text-sm text-slate-500">
                                Mesure de la dispersion des notes autour de la
                                moyenne
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                            <BarChart3 size={20} />
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="text-xs text-slate-500">Écart-type</div>

                        <div className="mt-1 text-2xl font-bold text-purple-600">
                            {statistiques.ecart_type !== null &&
                            statistiques.ecart_type !== undefined
                                ? formatNote(statistiques.ecart_type)
                                : "—"}
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                            Dispersion des notes autour de la moyenne
                        </p>
                    </div>
                </section>
            </div>
            {/* =====================================================
    ANALYSE STATISTIQUE AVANCÉE
====================================================== */}
            <section className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
                <div className="mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Analyse statistique avancée
                            </h2>

                            <p className="text-sm text-slate-500">
                                Analyse de la position centrale, de la
                                dispersion et des valeurs atypiques
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                            <BarChart3 size={20} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Q1 */}

                    <AnalysisCard
                        title="Premier quartile (Q1)"
                        value={
                            statistiques.analyse_avancee?.q1 !== null &&
                            statistiques.analyse_avancee?.q1 !== undefined
                                ? `${formatNote(statistiques.analyse_avancee.q1)} /20`
                                : "—"
                        }
                        description="25 % des notes sont inférieures ou égales"
                    />

                    {/* Médiane */}

                    <AnalysisCard
                        title="Médiane (Q2)"
                        value={
                            statistiques.mediane !== null &&
                            statistiques.mediane !== undefined
                                ? `${formatNote(statistiques.mediane)} /20`
                                : "—"
                        }
                        description="50 % des notes sont inférieures ou égales"
                    />

                    {/* Q3 */}

                    <AnalysisCard
                        title="Troisième quartile (Q3)"
                        value={
                            statistiques.analyse_avancee?.q3 !== null &&
                            statistiques.analyse_avancee?.q3 !== undefined
                                ? `${formatNote(statistiques.analyse_avancee.q3)} /20`
                                : "—"
                        }
                        description="75 % des notes sont inférieures ou égales"
                    />

                    {/* IQR */}

                    <AnalysisCard
                        title="Écart interquartile"
                        value={
                            statistiques.analyse_avancee
                                ?.ecart_interquartile !== null &&
                            statistiques.analyse_avancee
                                ?.ecart_interquartile !== undefined
                                ? formatNote(
                                      statistiques.analyse_avancee
                                          .ecart_interquartile,
                                  )
                                : "—"
                        }
                        description="Dispersion des 50 % centraux"
                    />

                    {/* Variance */}

                    <AnalysisCard
                        title="Variance"
                        value={
                            statistiques.analyse_avancee?.variance !== null &&
                            statistiques.analyse_avancee?.variance !== undefined
                                ? formatNote(
                                      statistiques.analyse_avancee.variance,
                                  )
                                : "—"
                        }
                        description="Mesure quadratique de la dispersion"
                    />

                    {/* Étendue */}

                    <AnalysisCard
                        title="Étendue"
                        value={
                            statistiques.analyse_avancee?.etendue !== null &&
                            statistiques.analyse_avancee?.etendue !== undefined
                                ? `${formatNote(
                                      statistiques.analyse_avancee.etendue,
                                  )} points`
                                : "—"
                        }
                        description="Différence entre la meilleure et la plus faible note"
                    />

                    {/* Coefficient de variation */}

                    <AnalysisCard
                        title="Coefficient de variation"
                        value={
                            statistiques.analyse_avancee
                                ?.coefficient_variation !== null &&
                            statistiques.analyse_avancee
                                ?.coefficient_variation !== undefined
                                ? `${formatNote(
                                      statistiques.analyse_avancee
                                          .coefficient_variation,
                                  )} %`
                                : "—"
                        }
                        description="Dispersion relative autour de la moyenne"
                    />

                    {/* Valeurs atypiques */}

                    <AnalysisCard
                        title="Valeurs atypiques"
                        value={
                            statistiques.analyse_avancee?.valeurs_atypiques ?? 0
                        }
                        description="Observations situées hors des bornes statistiques"
                    />
                </div>

                {/* Bornes statistiques */}

                <div className="mt-6 rounded-lg bg-slate-50 p-4">
                    <div className="mb-3 text-sm font-semibold text-slate-700">
                        Bornes de détection des valeurs atypiques
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <div className="text-xs text-slate-500">
                                Borne inférieure
                            </div>

                            <div className="mt-1 text-lg font-bold text-slate-700">
                                {statistiques.analyse_avancee
                                    ?.borne_inferieure !== null &&
                                statistiques.analyse_avancee
                                    ?.borne_inferieure !== undefined
                                    ? formatNote(
                                          statistiques.analyse_avancee
                                              .borne_inferieure,
                                      )
                                    : "—"}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-500">
                                Borne supérieure
                            </div>

                            <div className="mt-1 text-lg font-bold text-slate-700">
                                {statistiques.analyse_avancee
                                    ?.borne_superieure !== null &&
                                statistiques.analyse_avancee
                                    ?.borne_superieure !== undefined
                                    ? formatNote(
                                          statistiques.analyse_avancee
                                              .borne_superieure,
                                      )
                                    : "—"}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            ;
        </AdminLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Carte statistique
|--------------------------------------------------------------------------
*/

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconClass,
    valueClass = "text-slate-800",
}) {
    return (
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs font-medium text-slate-500">
                        {title}
                    </div>

                    <div className={`mt-2 text-2xl font-bold ${valueClass}`}>
                        {value}
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                        {subtitle}
                    </div>
                </div>

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}
                >
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Carte performance
|--------------------------------------------------------------------------
*/

function PerformanceCard({ title, value, subtitle, icon: Icon, className }) {
    return (
        <div className={`rounded-xl p-5 ${className}`}>
            <div className="flex items-center gap-2">
                <Icon size={19} />

                <span className="text-sm font-semibold">{title}</span>
            </div>

            <div className="mt-3 text-2xl font-bold">{value}</div>

            <div className="mt-1 text-xs opacity-70">{subtitle}</div>
        </div>
    );
}

function AnalysisCard({ title, value, description }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-xs font-medium text-slate-500">{title}</div>

            <div className="mt-2 text-xl font-bold text-slate-800">{value}</div>

            <div className="mt-1 text-xs leading-relaxed text-slate-400">
                {description}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| État vide
|--------------------------------------------------------------------------
*/

function EmptyState() {
    return (
        <div className="py-10 text-center">
            <div className="text-sm text-slate-400">
                Aucune statistique disponible pour le moment.
            </div>
        </div>
    );
}
