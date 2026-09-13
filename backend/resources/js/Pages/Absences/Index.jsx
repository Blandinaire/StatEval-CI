import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({
    absences = [],
    etablissements = [],
    classes = [],
    filters = {},
    isSuperAdmin = false,
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

    /*
     * Classes affichées dans le filtre.
     */
    const classesFiltrees = classes.filter(
        (classe) =>
            !filtres.etablissement_id ||
            String(classe.etablissement_id) ===
                String(filtres.etablissement_id),
    );

    /*
     * Modification d'un filtre.
     */
    function changerFiltre(nom, valeur) {
        const nouveauxFiltres = {
            ...filtres,
            [nom]: valeur,
        };

        /*
         * Si l'établissement change,
         * on réinitialise la classe.
         */
        if (nom === "etablissement_id") {
            nouveauxFiltres.classe_id = "";
        }

        // La recherche est gérée séparément avec un debounce.
        if (nom === "recherche") {
            return;
        }

        router.get(route("absences.index"), nouveauxFiltres, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function changerRecherche(valeur) {
        setRecherche(valeur);

        clearTimeout(rechercheTimer.current);

        rechercheTimer.current = setTimeout(() => {
            router.get(
                route("absences.index"),
                {
                    ...filtres,
                    recherche: valeur,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 500);
    }

    useEffect(() => {
        return () => {
            clearTimeout(rechercheTimer.current);
        };
    }, []);

    /*
     * Réinitialisation complète.
     */
    function reinitialiserFiltres() {
        clearTimeout(rechercheTimer.current);
        setRecherche("");

        router.get(
            route("absences.index"),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <AdminLayout>
            <Head title="Absences" />

            <div className="space-y-6">
                {/* =====================================================
                    EN-TÊTE
                ====================================================== */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Gestion des absences
                        </h1>

                        <p className="text-gray-500">
                            Suivi des absences des élèves
                        </p>
                    </div>

                    <Link
                        href={route("absences.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-center text-white hover:bg-blue-700"
                    >
                        + Nouvelle absence
                    </Link>
                </div>

                {/* =====================================================
                    FILTRES
                ====================================================== */}

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold">Filtres</h2>

                        <button
                            type="button"
                            onClick={reinitialiserFiltres}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            Réinitialiser
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* =================================================
                            ÉTABLISSEMENT
                        ================================================== */}

                        {isSuperAdmin && (
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Établissement
                                </label>

                                <select
                                    value={filtres.etablissement_id}
                                    onChange={(e) =>
                                        changerFiltre(
                                            "etablissement_id",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border p-3"
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

                        {/* =================================================
                            CLASSE
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Classe
                            </label>

                            <select
                                value={filtres.classe_id}
                                onChange={(e) =>
                                    changerFiltre("classe_id", e.target.value)
                                }
                                className="w-full rounded-lg border p-3"
                            >
                                <option value="">Toutes les classes</option>

                                {classesFiltrees.map((classe) => (
                                    <option key={classe.id} value={classe.id}>
                                        {classe.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* =================================================
                            PÉRIODE
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Période
                            </label>

                            <select
                                value={filtres.periode}
                                onChange={(e) =>
                                    changerFiltre("periode", e.target.value)
                                }
                                className="w-full rounded-lg border p-3"
                            >
                                <option value="">Toutes les périodes</option>

                                <option value="Trimestre 1">Trimestre 1</option>

                                <option value="Trimestre 2">Trimestre 2</option>

                                <option value="Trimestre 3">Trimestre 3</option>

                                <option value="Semestre 1">Semestre 1</option>

                                <option value="Semestre 2">Semestre 2</option>
                            </select>
                        </div>

                        {/* =================================================
                            RECHERCHE
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Recherche
                            </label>

                            <input
                                type="text"
                                value={recherche}
                                onChange={(e) =>
                                    changerRecherche(e.target.value)
                                }
                                placeholder="Nom, prénom, matricule..."
                                className="w-full rounded-lg border p-3"
                            />
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    TABLEAU
                ====================================================== */}

                <div className="overflow-hidden rounded-xl border bg-white">
                    <ResponsiveTable minWidth="1100px">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Date</th>

                                <th className="p-3 text-left">Élève</th>

                                <th className="p-3 text-left">Classe</th>

                                <th className="p-3 text-left">Éducateur</th>

                                <th className="p-3 text-center">Durée</th>

                                <th className="p-3 text-center">
                                    Justification
                                </th>

                                <th className="p-3 text-center">Billet</th>

                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {absences.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="p-6 text-center text-gray-500"
                                    >
                                        Aucune absence enregistrée.
                                    </td>
                                </tr>
                            ) : (
                                absences.map((absence) => (
                                    <tr
                                        key={absence.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        {/* Date */}

                                        <td className="p-3">
                                            {absence.date_absence
                                                ? new Date(
                                                      absence.date_absence,
                                                  ).toLocaleDateString("fr-FR")
                                                : "-"}
                                        </td>

                                        {/* Élève */}

                                        <td className="p-3">
                                            {absence.eleve
                                                ? `${absence.eleve.nom} ${absence.eleve.prenoms}`
                                                : "-"}
                                        </td>

                                        {/* Classe */}

                                        <td className="p-3">
                                            {absence.classe?.libelle ?? "-"}
                                        </td>

                                        {/* Éducateur */}

                                        <td className="p-3">
                                            {absence.educateur
                                                ? `${absence.educateur.nom} ${absence.educateur.prenoms}`
                                                : "-"}
                                        </td>

                                        {/* Durée */}

                                        <td className="p-3 text-center">
                                            {absence.duree_heures
                                                ? `${absence.duree_heures} h`
                                                : "-"}
                                        </td>

                                        {/* Justification */}

                                        <td className="p-3 text-center">
                                            <span
                                                className={
                                                    absence.justifiee
                                                        ? "rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700"
                                                        : "rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-700"
                                                }
                                            >
                                                {absence.justifiee
                                                    ? "Justifiée"
                                                    : "Non justifiée"}
                                            </span>
                                        </td>

                                        {/* Billet */}

                                        <td className="p-3 text-center">
                                            <span
                                                className={
                                                    absence.billet_edite
                                                        ? "rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700"
                                                        : "rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700"
                                                }
                                            >
                                                {absence.billet_edite
                                                    ? "Édité"
                                                    : "Non édité"}
                                            </span>
                                        </td>

                                        {/* Actions */}

                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={route(
                                                        "absences.show",
                                                        absence.id,
                                                    )}
                                                    className="rounded bg-slate-600 px-3 py-2 text-sm text-white hover:bg-slate-700"
                                                >
                                                    Voir
                                                </Link>

                                                <Link
                                                    href={route(
                                                        "absences.edit",
                                                        absence.id,
                                                    )}
                                                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                                >
                                                    Modifier
                                                </Link>

                                                <a
                                                    href={route(
                                                        "absences.billet.pdf",
                                                        absence.id,
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
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
