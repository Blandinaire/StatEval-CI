import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({
    retards = [],
    etablissements = [],
    classes = [],
    filters = {},
    isSuperAdmin = false,
    hasPeriode = false,
}) {
    const filtres = {
        etablissement_id: "",
        classe_id: "",
        periode: "",
        recherche: "",
        ...filters,
    };

    // État local de recherche : la saisie reste fluide pendant les requêtes Inertia.
    const [recherche, setRecherche] = useState(filtres.recherche || "");
    const rechercheTimer = useRef(null);

    function appliquerFiltre(nouveauxFiltres) {
        router.get(route("retards.index"), nouveauxFiltres, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function handleEtablissementChange(value) {
        appliquerFiltre({
            ...filtres,
            etablissement_id: value,
            classe_id: "",
        });
    }

    function handleClasseChange(value) {
        appliquerFiltre({
            ...filtres,
            classe_id: value,
        });
    }

    function handlePeriodeChange(value) {
        appliquerFiltre({
            ...filtres,
            periode: value,
        });
    }

    function handleRechercheChange(value) {
        setRecherche(value);

        clearTimeout(rechercheTimer.current);

        rechercheTimer.current = setTimeout(() => {
            appliquerFiltre({
                ...filtres,
                recherche: value,
            });
        }, 500);
    }

    useEffect(() => {
        return () => {
            clearTimeout(rechercheTimer.current);
        };
    }, []);

    function reinitialiser() {
        clearTimeout(rechercheTimer.current);
        setRecherche("");

        appliquerFiltre({
            etablissement_id: "",
            classe_id: "",
            periode: "",
            recherche: "",
        });
    }

    return (
        <AdminLayout>
            <Head title="Gestion des retards" />

            <div className="space-y-6">
                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                            Gestion des retards
                        </h1>

                        <p className="text-gray-500">
                            Suivi des retards des élèves
                        </p>
                    </div>

                    <Link
                        href={route("retards.create")}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >
                        + Enregistrer un retard
                    </Link>
                </div>

                {/* =====================================================
                    FILTRES
                ===================================================== */}

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800">
                            Filtres
                        </h2>

                        <button
                            type="button"
                            onClick={reinitialiser}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            Réinitialiser
                        </button>
                    </div>

                    <div
                        className={`grid grid-cols-1 gap-4 ${
                            isSuperAdmin
                                ? "md:grid-cols-2 xl:grid-cols-4"
                                : "md:grid-cols-3"
                        }`}
                    >
                        {/* Établissement */}

                        {isSuperAdmin && (
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Établissement
                                </label>

                                <select
                                    value={filtres.etablissement_id}
                                    onChange={(e) =>
                                        handleEtablissementChange(
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                        )}

                        {/* Classe */}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Classe
                            </label>

                            <select
                                value={filtres.classe_id}
                                onChange={(e) =>
                                    handleClasseChange(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            >
                                <option value="">Toutes les classes</option>

                                {classes.map((classe) => (
                                    <option key={classe.id} value={classe.id}>
                                        {classe.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Période */}

                        {hasPeriode && (
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Période
                                </label>

                                <select
                                    value={filtres.periode}
                                    onChange={(e) =>
                                        handlePeriodeChange(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                >
                                    <option value="">
                                        Toutes les périodes
                                    </option>

                                    <option value="Trimestre 1">
                                        Trimestre 1
                                    </option>

                                    <option value="Trimestre 2">
                                        Trimestre 2
                                    </option>

                                    <option value="Trimestre 3">
                                        Trimestre 3
                                    </option>

                                    <option value="Semestre 1">
                                        Semestre 1
                                    </option>

                                    <option value="Semestre 2">
                                        Semestre 2
                                    </option>
                                </select>
                            </div>
                        )}

                        {/* Recherche */}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Recherche
                            </label>

                            <input
                                type="text"
                                value={recherche}
                                onChange={(e) =>
                                    handleRechercheChange(e.target.value)
                                }
                                placeholder="Nom, prénom, matricule..."
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    TABLEAU
                ===================================================== */}

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <ResponsiveTable minWidth="1400px">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Élève</th>

                                <th className="p-3 text-left">Éducateur</th>

                                <th className="p-3 text-left">Date</th>

                                <th className="p-3 text-left">Classe</th>

                                <th className="p-3 text-center">
                                    Heure prévue
                                </th>

                                <th className="p-3 text-center">
                                    Heure arrivée
                                </th>

                                <th className="p-3 text-center">Durée</th>

                                <th className="p-3 text-center">Billet</th>

                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {retards.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="p-8 text-center text-gray-500"
                                    >
                                        Aucun retard enregistré.
                                    </td>
                                </tr>
                            ) : (
                                retards.map((retard) => (
                                    <tr
                                        key={retard.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        {/* Élève */}

                                        <td className="p-3 font-medium">
                                            {retard.eleve
                                                ? `${retard.eleve.nom} ${retard.eleve.prenoms}`
                                                : "-"}
                                        </td>

                                        {/* Éducateur */}

                                        <td className="p-3">
                                            {retard.educateur
                                                ? `${retard.educateur.nom} ${retard.educateur.prenoms}`
                                                : "-"}
                                        </td>

                                        {/* Date */}

                                        <td className="p-3">
                                            {retard.date_retard
                                                ? new Date(
                                                      retard.date_retard,
                                                  ).toLocaleDateString("fr-FR")
                                                : "-"}
                                        </td>

                                        {/* Classe */}

                                        <td className="p-3">
                                            {retard.classe?.libelle ?? "-"}
                                        </td>

                                        {/* Heure prévue */}

                                        <td className="p-3 text-center">
                                            {retard.heure_prevue ?? "-"}
                                        </td>

                                        {/* Heure arrivée */}

                                        <td className="p-3 text-center">
                                            {retard.heure_arrivee ?? "-"}
                                        </td>

                                        {/* Durée */}

                                        <td className="p-3 text-center">
                                            <span className="rounded-lg bg-orange-100 px-3 py-1 font-semibold text-orange-700">
                                                {retard.duree_minutes ?? 0} min
                                            </span>
                                        </td>

                                        {/* Billet */}

                                        <td className="p-3 text-center">
                                            {retard.billet_edite ? (
                                                <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                                                    Édité
                                                </span>
                                            ) : (
                                                <span className="rounded-lg bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-600">
                                                    Non édité
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}

                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={route(
                                                        "retards.show",
                                                        retard.id,
                                                    )}
                                                    className="rounded bg-slate-600 px-3 py-2 text-sm text-white hover:bg-slate-700"
                                                >
                                                    Voir
                                                </Link>

                                                <Link
                                                    href={route(
                                                        "retards.edit",
                                                        retard.id,
                                                    )}
                                                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                                >
                                                    Modifier
                                                </Link>

                                                <a
                                                    href={route(
                                                        "retards.billet.pdf",
                                                        retard.id,
                                                    )}
                                                    className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                                                >
                                                    PDF
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </ResponsiveTable>
                </div>
            </div>
        </AdminLayout>
    );
}
