import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { DoorOpen, Pencil, Plus, Power, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

const TYPES = [
    "Salle de classe",
    "Laboratoire",
    "Salle informatique",
    "Salle spécialisée",
    "Salle des professeurs",
    "Autre",
];

const formulaireInitial = {
    nom: "",
    type: "Salle de classe",
    capacite: "",
    etablissement_id: "",
};

export default function Index({
    salles = [],
    etablissements = [],
    isSuperAdmin = false,
    etablissementId = null,
}) {
    const [recherche, setRecherche] = useState("");
    const [filtreType, setFiltreType] = useState("");
    const [filtreStatut, setFiltreStatut] = useState("actives");

    const [modal, setModal] = useState(false);
    const [edition, setEdition] = useState(null);
    const [formulaire, setFormulaire] = useState(formulaireInitial);
    const [erreurs, setErreurs] = useState({});

    const sallesFiltrees = useMemo(() => {
        return salles.filter((salle) => {
            const texte = recherche.trim().toLowerCase();

            const correspondRecherche =
                !texte ||
                salle.nom?.toLowerCase().includes(texte) ||
                salle.type?.toLowerCase().includes(texte) ||
                salle.etablissement?.nom?.toLowerCase().includes(texte);

            const correspondType = !filtreType || salle.type === filtreType;

            const correspondStatut =
                filtreStatut === "toutes" ||
                (filtreStatut === "actives" && salle.active) ||
                (filtreStatut === "inactives" && !salle.active);

            return correspondRecherche && correspondType && correspondStatut;
        });
    }, [salles, recherche, filtreType, filtreStatut]);

    function ouvrirCreation() {
        setEdition(null);
        setErreurs({});

        setFormulaire({
            ...formulaireInitial,
            etablissement_id: isSuperAdmin ? "" : String(etablissementId ?? ""),
        });

        setModal(true);
    }

    function ouvrirEdition(salle) {
        setEdition(salle);
        setErreurs({});

        setFormulaire({
            nom: salle.nom ?? "",
            type: salle.type ?? "Salle de classe",
            capacite: salle.capacite ?? "",
            etablissement_id: String(salle.etablissement_id),
        });

        setModal(true);
    }

    function fermerModal() {
        setModal(false);
        setEdition(null);
        setErreurs({});
    }

    function modifierChamp(champ, valeur) {
        setFormulaire((ancien) => ({
            ...ancien,
            [champ]: valeur,
        }));
    }

    function enregistrer(event) {
        event.preventDefault();

        setErreurs({});

        const donnees = {
            nom: formulaire.nom,
            type: formulaire.type,
            capacite: formulaire.capacite || null,
            etablissement_id: formulaire.etablissement_id || etablissementId,
        };

        console.log("DONNÉES ENVOYÉES :", donnees);
        console.log("MODE ÉDITION :", edition);

        if (edition) {
            router.put(route("salles.update", edition.id), donnees, {
                preserveScroll: true,
                preserveState: true,

                onSuccess: () => {
                    fermerModal();
                },

                onError: (errors) => {
                    console.error("ERREURS VALIDATION :", errors);

                    setErreurs(errors);
                },

                onFinish: () => {
                    console.log("REQUÊTE MODIFICATION TERMINÉE");
                },
            });

            return;
        }

        router.post(route("salles.store"), donnees, {
            preserveScroll: true,
            preserveState: true,

            onSuccess: () => {
                fermerModal();
            },

            onError: (errors) => {
                console.error("ERREURS VALIDATION :", errors);

                setErreurs(errors);
            },

            onFinish: () => {
                console.log("REQUÊTE CRÉATION TERMINÉE");
            },
        });
    }

    function changerStatut(salle) {
        router.patch(
            route("salles.toggle", salle.id),
            {},
            {
                preserveScroll: true,
            },
        );
    }

    function supprimer(salle) {
        if (!confirm(`Supprimer définitivement la salle "${salle.nom}" ?`)) {
            return;
        }

        router.delete(route("salles.destroy", salle.id), {
            preserveScroll: true,
        });
    }

    return (
        <AdminLayout>
            <Head title="Gestion des salles" />

            <div className="space-y-6">
                {/* =====================================================
                    EN-TÊTE
                ====================================================== */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-teal-100 p-3 text-teal-700">
                                <DoorOpen size={24} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Gestion des salles
                                </h1>

                                <p className="text-sm text-gray-500">
                                    Gérez les salles disponibles dans
                                    l’établissement.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={ouvrirCreation}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
                    >
                        <Plus size={18} />
                        Nouvelle salle
                    </button>
                </div>

                {/* =====================================================
                    FILTRES
                ====================================================== */}

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={recherche}
                                onChange={(e) => setRecherche(e.target.value)}
                                placeholder="Rechercher une salle..."
                                className="w-full rounded-lg border-gray-300 pl-10 text-sm"
                            />
                        </div>

                        <select
                            value={filtreType}
                            onChange={(e) => setFiltreType(e.target.value)}
                            className="rounded-lg border-gray-300 text-sm"
                        >
                            <option value="">Tous les types</option>

                            {TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filtreStatut}
                            onChange={(e) => setFiltreStatut(e.target.value)}
                            className="rounded-lg border-gray-300 text-sm"
                        >
                            <option value="actives">Salles actives</option>

                            <option value="inactives">Salles inactives</option>

                            <option value="toutes">Toutes les salles</option>
                        </select>
                    </div>
                </div>

                {/* =====================================================
                    TABLEAU
                ====================================================== */}

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-700">
                                        Salle
                                    </th>

                                    <th className="px-4 py-3 font-semibold text-gray-700">
                                        Type
                                    </th>

                                    <th className="px-4 py-3 font-semibold text-gray-700">
                                        Capacité
                                    </th>

                                    {isSuperAdmin && (
                                        <th className="px-4 py-3 font-semibold text-gray-700">
                                            Établissement
                                        </th>
                                    )}

                                    <th className="px-4 py-3 font-semibold text-gray-700">
                                        Statut
                                    </th>

                                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {sallesFiltrees.map((salle) => (
                                    <tr
                                        key={salle.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                                                    <DoorOpen size={18} />
                                                </div>

                                                <span className="font-semibold text-gray-900">
                                                    {salle.nom}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-gray-600">
                                            {salle.type}
                                        </td>

                                        <td className="px-4 py-4 text-gray-600">
                                            {salle.capacite
                                                ? `${salle.capacite} places`
                                                : "—"}
                                        </td>

                                        {isSuperAdmin && (
                                            <td className="px-4 py-4 text-gray-600">
                                                {salle.etablissement?.nom ??
                                                    "—"}
                                            </td>
                                        )}

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    salle.active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {salle.active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        ouvrirEdition(salle)
                                                    }
                                                    title="Modifier"
                                                    className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changerStatut(salle)
                                                    }
                                                    title={
                                                        salle.active
                                                            ? "Désactiver"
                                                            : "Activer"
                                                    }
                                                    className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                                                >
                                                    <Power size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        supprimer(salle)
                                                    }
                                                    title="Supprimer"
                                                    className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {sallesFiltrees.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={isSuperAdmin ? 6 : 5}
                                            className="px-4 py-12 text-center text-gray-500"
                                        >
                                            Aucune salle ne correspond aux
                                            critères.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* =====================================================
                    MODALE
                ====================================================== */}

                {modal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4">
                        <section
                            role="dialog"
                            aria-modal="true"
                            className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b px-5 py-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        {edition
                                            ? "Modifier la salle"
                                            : "Nouvelle salle"}
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Renseignez les caractéristiques de la
                                        salle.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={fermerModal}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                >
                                    <X size={19} />
                                </button>
                            </div>

                            <form
                                onSubmit={enregistrer}
                                className="space-y-4 p-5"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Nom / numéro de la salle
                                    </label>

                                    <input
                                        required
                                        value={formulaire.nom}
                                        onChange={(e) =>
                                            modifierChamp("nom", e.target.value)
                                        }
                                        placeholder="Ex. Salle 101"
                                        maxLength={80}
                                        className="mt-1 w-full rounded-lg border-gray-300 text-sm"
                                    />

                                    {erreurs.nom && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {erreurs.nom}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Type
                                    </label>

                                    <select
                                        value={formulaire.type}
                                        onChange={(e) =>
                                            modifierChamp(
                                                "type",
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full rounded-lg border-gray-300 text-sm"
                                    >
                                        {TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Capacité
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={formulaire.capacite}
                                        onChange={(e) =>
                                            modifierChamp(
                                                "capacite",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Ex. 60"
                                        className="mt-1 w-full rounded-lg border-gray-300 text-sm"
                                    />
                                </div>

                                {isSuperAdmin && !edition && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Établissement
                                        </label>

                                        <select
                                            required
                                            value={formulaire.etablissement_id}
                                            onChange={(e) =>
                                                modifierChamp(
                                                    "etablissement_id",
                                                    e.target.value,
                                                )
                                            }
                                            className="mt-1 w-full rounded-lg border-gray-300 text-sm"
                                        >
                                            <option value="">
                                                Sélectionner...
                                            </option>

                                            {etablissements.map(
                                                (etablissement) => (
                                                    <option
                                                        key={etablissement.id}
                                                        value={etablissement.id}
                                                    >
                                                        {etablissement.nom}
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        {erreurs.etablissement_id && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {erreurs.etablissement_id}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 border-t pt-4">
                                    <button
                                        type="button"
                                        onClick={fermerModal}
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="submit"
                                        className="rounded-lg bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                                    >
                                        {edition
                                            ? "Enregistrer les modifications"
                                            : "Créer la salle"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
