import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({
    conduites = [],
    etablissements = [],
    classes = [],
    periodesScolaires = [],
    filters = {},
    isSuperAdmin = false,
    isEducateur = false,
}) {
    const filtres = {
        etablissement_id: "",
        classe_id: "",
        periode_scolaire_id: "",
        recherche: "",
        ...filters,
    };

    // État local de recherche : la saisie reste fluide pendant les requêtes Inertia.
    const [recherche, setRecherche] = useState(filtres.recherche || "");
    const rechercheTimer = useRef(null);

    function supprimerConduitesClasse() {
        const classe = classes.find(
            (item) => String(item.id) === String(filtres.classe_id),
        );
        const periode = periodesScolaires.find(
            (item) =>
                String(item.id) === String(filtres.periode_scolaire_id),
        );

        if (!classe || !periode) {
            window.alert(
                "La classe ou la période sélectionnée n’est plus disponible. Actualisez la page puis réessayez.",
            );
            return;
        }

        if (
            !window.confirm(
                `Supprimer ${isEducateur ? "les notes de conduite que vous avez saisies" : "toutes les notes de conduite"} de la classe « ${classe.libelle} » pour la période « ${periode.libelle} » ? Cette action est irréversible.`,
            )
        ) {
            return;
        }

        router.delete(
            route("conduites.destroy-classe", {
                classe: classe.id,
                periodeScolaire: periode.id,
            }),
            {
                preserveScroll: true,
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mise à jour des filtres
    |--------------------------------------------------------------------------
    */

    function changerFiltre(nom, valeur) {
        const nouveauxFiltres = {
            ...filtres,
            [nom]: valeur,
        };

        /*
        |--------------------------------------------------------------------------
        | Si changement établissement
        |--------------------------------------------------------------------------
        */

        if (nom === "etablissement_id") {
            nouveauxFiltres.classe_id = "";
        }

        // La recherche est gérée séparément avec un debounce.
        if (nom === "recherche") {
            return;
        }

        router.get(route("conduites.index"), nouveauxFiltres, {
            preserveState: true,
            replace: true,
        });
    }

    function changerRecherche(valeur) {
        setRecherche(valeur);

        clearTimeout(rechercheTimer.current);

        rechercheTimer.current = setTimeout(() => {
            router.get(
                route("conduites.index"),
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
    |--------------------------------------------------------------------------
    | Réinitialisation
    |--------------------------------------------------------------------------
    */

    function reinitialiserFiltres() {
        clearTimeout(rechercheTimer.current);
        setRecherche("");

        router.get(
            route("conduites.index"),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    return (
        <AdminLayout>
            <Head title="Notes de conduite" />

            <div className="space-y-6">
                {/* ============================================= */}
                {/* EN-TÊTE */}
                {/* ============================================= */}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Notes de conduite
                        </h1>

                        <p className="text-gray-500">
                            Gestion et consultation des notes de conduite des
                            élèves
                        </p>
                    </div>

                    <Link
                        href={route("conduites.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                    >
                        + Nouvelle note de conduite
                    </Link>
                </div>

                {/* ============================================= */}
                {/* FILTRES */}
                {/* ============================================= */}

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold">Filtres</h2>

                        <p className="text-sm text-gray-500">
                            Affinez l'affichage des notes de conduite.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {/* ===================================== */}
                        {/* ÉTABLISSEMENT */}
                        {/* ===================================== */}

                        {isSuperAdmin && (
                            <div>
                                <label className="mb-1 block text-sm font-semibold">
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

                        {/* ===================================== */}
                        {/* CLASSE */}
                        {/* ===================================== */}

                        <div>
                            <label className="mb-1 block text-sm font-semibold">
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

                                {classes.map((classe) => (
                                    <option key={classe.id} value={classe.id}>
                                        {classe.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ===================================== */}
                        {/* PÉRIODE SCOLAIRE */}
                        {/* ===================================== */}

                        <div>
                            <label className="mb-1 block text-sm font-semibold">
                                Période scolaire
                            </label>

                            <select
                                value={filtres.periode_scolaire_id}
                                onChange={(e) =>
                                    changerFiltre(
                                        "periode_scolaire_id",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border p-3"
                            >
                                <option value="">Toutes les périodes</option>

                                {periodesScolaires.map((periode) => (
                                    <option key={periode.id} value={periode.id}>
                                        {periode.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ===================================== */}
                        {/* RECHERCHE */}
                        {/* ===================================== */}

                        <div className="lg:col-span-2">
                            <label className="mb-1 block text-sm font-semibold">
                                Rechercher un élève
                            </label>

                            <input
                                type="text"
                                value={recherche}
                                onChange={(e) =>
                                    changerRecherche(e.target.value)
                                }
                                placeholder="Nom, prénom ou matricule..."
                                className="w-full rounded-lg border p-3"
                            />
                        </div>
                    </div>

                    {/* ========================================= */}
                    {/* ACTION */}
                    {/* ========================================= */}

                    <div className="mt-5 flex justify-end">
                        <button
                            type="button"
                            onClick={reinitialiserFiltres}
                            className="rounded-lg border px-5 py-2 hover:bg-gray-50"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                </div>

                {/* ============================================= */}
                {/* TABLEAU */}
                {/* ============================================= */}

                <div className="overflow-hidden rounded-xl border bg-white">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <div>
                            <h2 className="font-bold">Résultats</h2>

                            <p className="text-sm text-gray-500">
                                {conduites.length} note
                                {conduites.length > 1 ? "s" : ""} trouvée
                                {conduites.length > 1 ? "s" : ""}
                            </p>
                        </div>

                        {filtres.classe_id &&
                            filtres.periode_scolaire_id && (
                                <button
                                    type="button"
                                    onClick={supprimerConduitesClasse}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Supprimer les notes de la classe
                                </button>
                            )}
                    </div>

                    <div className="rounded-xl bg-white shadow">
                        <ResponsiveTable minWidth="1000px">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">Élève</th>

                                    <th className="p-3 text-left">Éducateur</th>

                                    <th className="p-3 text-left">
                                        Année scolaire
                                    </th>

                                    <th className="p-3 text-left">Classe</th>

                                    <th className="p-3 text-left">Période</th>

                                    <th className="p-3 text-center">Note</th>

                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {conduites.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="p-10 text-center text-gray-500"
                                        >
                                            Aucune note de conduite trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    conduites.map((conduite) => (
                                        <tr
                                            key={conduite.id}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="p-3">
                                                {conduite.eleve
                                                    ? `${conduite.eleve.nom} ${conduite.eleve.prenoms}`
                                                    : "-"}
                                            </td>

                                            <td className="p-3">
                                                {conduite.educateur
                                                    ? `${conduite.educateur.nom} ${conduite.educateur.prenoms}`
                                                    : "-"}
                                            </td>

                                            <td className="p-3">
                                                {conduite.annee_scolaire
                                                    ?.libelle ?? "-"}
                                            </td>

                                            <td className="p-3">
                                                {conduite.classe?.libelle ??
                                                    "-"}
                                            </td>

                                            <td className="p-3">
                                                {conduite.periode_scolaire
                                                    ?.libelle ??
                                                    conduite.periode ??
                                                    "-"}
                                            </td>

                                            <td className="p-3 text-center">
                                                <span className="rounded-lg bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                                                    {Number(
                                                        conduite.note,
                                                    ).toFixed(2)}
                                                    /20
                                                </span>
                                            </td>

                                            <td className="p-3 text-center">
                                                <Link
                                                    href={route(
                                                        "conduites.edit",
                                                        conduite.id,
                                                    )}
                                                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                                >
                                                    Modifier
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </ResponsiveTable>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
