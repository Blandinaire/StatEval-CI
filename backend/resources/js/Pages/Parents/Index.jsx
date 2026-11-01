import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";

export default function Index() {
    const {
        parents,
        stats,
        etablissements,
        niveaux = [],
        classes = [],
        filtres,
        isSuperAdmin,
    } = usePage().props;

    const [recherche, setRecherche] = useState(filtres.recherche || "");
    const [statut, setStatut] = useState(filtres.statut || "");
    const [etablissementId, setEtablissementId] = useState(
        filtres.etablissement_id || "",
    );

    const [typePerimetre, setTypePerimetre] = useState("etablissement");
    const [niveauId, setNiveauId] = useState("");
    const [classeId, setClasseId] = useState("");

    const [apercu, setApercu] = useState(null);
    const [chargementApercu, setChargementApercu] = useState(false);
    const [generation, setGeneration] = useState(false);
    const [erreur, setErreur] = useState("");

    const classesFiltrees = classes.filter(
        (classe) => !niveauId || String(classe.niveau_id) === String(niveauId),
    );

    const filtrer = (e) => {
        e.preventDefault();

        router.get(
            route("parents.index"),
            {
                recherche,
                statut,
                etablissement_id: etablissementId,
            },
            { preserveState: true, replace: true },
        );
    };

    const donneesGeneration = () => ({
        etablissement_id: etablissementId,
        type_perimetre: typePerimetre,
        niveau_id: niveauId,
        classe_id: classeId,
    });

    const afficherApercu = async () => {
        setErreur("");
        setApercu(null);

        if (isSuperAdmin && !etablissementId) {
            setErreur("Veuillez sélectionner un établissement.");
            return;
        }

        if (typePerimetre === "niveau" && !niveauId) {
            setErreur("Veuillez sélectionner un niveau.");
            return;
        }

        if (typePerimetre === "classe" && !classeId) {
            setErreur("Veuillez sélectionner une classe.");
            return;
        }

        setChargementApercu(true);

        try {
            const response = await axios.post(
                route("parents.previsualiser"),
                donneesGeneration(),
            );

            setApercu(response.data);
        } catch (error) {
            setErreur(
                error.response?.data?.message ||
                    "Impossible de préparer l'aperçu.",
            );
        } finally {
            setChargementApercu(false);
        }
    };

    const lancerGeneration = () => {
        if (!apercu) return;

        if (apercu.nouveaux_comptes === 0 && apercu.eleves === 0) {
            setErreur("Aucun élève à traiter dans ce périmètre.");
            return;
        }

        if (
            !confirm(
                `Confirmer la génération ?\n\n` +
                    `${apercu.nouveaux_comptes} nouveau(x) compte(s) à créer.\n` +
                    `${apercu.comptes_existants} compte(s) déjà existant(s).\n\n` +
                    `Les comptes existants seront réutilisés.`,
            )
        ) {
            return;
        }

        setGeneration(true);
        setErreur("");

        router.post(route("parents.generer"), donneesGeneration(), {
            preserveScroll: true,
            onFinish: () => setGeneration(false),
            onSuccess: () => setApercu(null),
        });
    };

    return (
        <AdminLayout>
            <Head title="Gestion des comptes parents" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Comptes parents
                    </h1>
                    <p className="mt-1 text-gray-500">
                        Gestion des accès des parents et consultation des élèves
                        associés.
                    </p>
                </div>

                {/* GÉNÉRATION AUTOMATIQUE */}
                <div className="rounded-xl border bg-white p-5 shadow-sm space-y-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">
                            Génération automatique des comptes
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Sélectionnez les élèves concernés, vérifiez l'aperçu
                            puis confirmez la création des comptes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {isSuperAdmin && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Établissement
                                </label>

                                <select
                                    value={etablissementId || ""}
                                    onChange={(e) => {
                                        setEtablissementId(e.target.value);
                                        setApercu(null);
                                    }}
                                    className="w-full rounded-lg border-gray-300"
                                >
                                    <option value="">
                                        Sélectionner un établissement
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

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Périmètre de génération
                            </label>

                            <select
                                value={typePerimetre}
                                onChange={(e) => {
                                    setTypePerimetre(e.target.value);
                                    setApercu(null);
                                }}
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="etablissement">
                                    Tout l'établissement
                                </option>
                                <option value="niveau">Un niveau</option>
                                <option value="classe">Une classe</option>
                            </select>
                        </div>

                        {typePerimetre === "niveau" && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Niveau
                                </label>

                                <select
                                    value={niveauId}
                                    onChange={(e) => {
                                        setNiveauId(e.target.value);
                                        setApercu(null);
                                    }}
                                    className="w-full rounded-lg border-gray-300"
                                >
                                    <option value="">
                                        Sélectionner un niveau
                                    </option>

                                    {niveaux.map((niveau) => (
                                        <option
                                            key={niveau.id}
                                            value={niveau.id}
                                        >
                                            {niveau.libelle}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {typePerimetre === "classe" && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Classe
                                </label>

                                <select
                                    value={classeId}
                                    onChange={(e) => {
                                        setClasseId(e.target.value);
                                        setApercu(null);
                                    }}
                                    className="w-full rounded-lg border-gray-300"
                                >
                                    <option value="">
                                        Sélectionner une classe
                                    </option>

                                    {classes.map((classe) => (
                                        <option
                                            key={classe.id}
                                            value={classe.id}
                                        >
                                            {classe.libelle}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {erreur && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {erreur}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={afficherApercu}
                            disabled={chargementApercu || generation}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {chargementApercu
                                ? "Calcul de l'aperçu..."
                                : "Afficher l'aperçu"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setApercu(null);
                                setErreur("");
                            }}
                            className="rounded-lg border px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Réinitialiser l'aperçu
                        </button>
                    </div>

                    {/* RÉSULTAT DE L'APERÇU */}
                    {apercu && (
                        <div className="border-t pt-5 space-y-4">
                            <h3 className="font-bold text-gray-800">
                                Résultat de l'aperçu
                            </h3>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                {[
                                    [
                                        "Élèves concernés",
                                        apercu.eleves,
                                        "text-gray-800",
                                    ],
                                    [
                                        "Parents distincts",
                                        apercu.parents_distincts,
                                        "text-gray-800",
                                    ],
                                    [
                                        "Comptes existants",
                                        apercu.comptes_existants,
                                        "text-blue-700",
                                    ],
                                    [
                                        "Nouveaux comptes",
                                        apercu.nouveaux_comptes,
                                        "text-green-700",
                                    ],
                                    [
                                        "Sans téléphone / nom",
                                        apercu.sans_telephone,
                                        "text-red-600",
                                    ],
                                    [
                                        "Sans matricule",
                                        apercu.sans_matricule,
                                        "text-orange-600",
                                    ],
                                ].map(([label, valeur, couleur]) => (
                                    <div
                                        key={label}
                                        className="rounded-lg border bg-gray-50 p-4"
                                    >
                                        <p className="text-sm text-gray-500">
                                            {label}
                                        </p>
                                        <p
                                            className={`mt-1 text-2xl font-bold ${couleur}`}
                                        >
                                            {valeur}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <p className="text-sm text-gray-600">
                                Les comptes existants seront réutilisés. Aucun
                                compte parent créé manuellement ne sera supprimé
                                ou remplacé.
                            </p>

                            <button
                                type="button"
                                onClick={lancerGeneration}
                                disabled={generation}
                                className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                {generation
                                    ? "Génération en cours..."
                                    : "Confirmer et générer les comptes"}
                            </button>
                        </div>
                    )}
                </div>

                {/* STATISTIQUES */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        ["Total parents", stats.total, "text-gray-800"],
                        ["Comptes actifs", stats.actifs, "text-green-600"],
                        ["Comptes désactivés", stats.inactifs, "text-red-600"],
                    ].map(([label, valeur, couleur]) => (
                        <div
                            key={label}
                            className="rounded-xl border bg-white p-5 shadow-sm"
                        >
                            <p className="text-sm text-gray-500">{label}</p>
                            <p className={`mt-2 text-3xl font-bold ${couleur}`}>
                                {valeur}
                            </p>
                        </div>
                    ))}
                </div>

                {/* FILTRES */}
                <form
                    onSubmit={filtrer}
                    className="flex flex-col gap-3 rounded-xl border bg-white p-4 md:flex-row"
                >
                    <input
                        type="search"
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        placeholder="Nom, téléphone ou adresse e-mail..."
                        className="flex-1 rounded-lg border-gray-300"
                    />

                    <select
                        value={statut}
                        onChange={(e) => setStatut(e.target.value)}
                        className="rounded-lg border-gray-300"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="actif">Actifs</option>
                        <option value="inactif">Désactivés</option>
                    </select>

                    {isSuperAdmin && (
                        <select
                            value={etablissementId}
                            onChange={(e) => setEtablissementId(e.target.value)}
                            className="rounded-lg border-gray-300"
                        >
                            <option value="">Tous les établissements</option>
                            {etablissements.map((etablissement) => (
                                <option
                                    key={etablissement.id}
                                    value={etablissement.id}
                                >
                                    {etablissement.nom}
                                </option>
                            ))}
                        </select>
                    )}

                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
                    >
                        Rechercher
                    </button>
                </form>

                {/* LISTE DES PARENTS */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="border-b bg-slate-50 px-6 py-4">
                        <h2 className="text-lg font-bold text-gray-800">
                            Liste des parents
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    {[
                                        "Parent",
                                        "Téléphone",
                                        "Établissement",
                                        "Enfants",
                                        "Statut",
                                    ].map((titre) => (
                                        <th
                                            key={titre}
                                            className="px-5 py-4 text-left text-sm font-semibold"
                                        >
                                            {titre}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {parents.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="p-10 text-center text-gray-500"
                                        >
                                            Aucun compte parent trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    parents.data.map((parent) => (
                                        <tr
                                            key={parent.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-gray-800">
                                                    {parent.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {parent.email ||
                                                        "Aucun e-mail"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                {parent.telephone || "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                {parent.etablissement?.nom ||
                                                    "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-semibold">
                                                    {parent.eleves?.length || 0}{" "}
                                                    élève(s)
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {parent.eleves
                                                        ?.map(
                                                            (eleve) =>
                                                                `${eleve.nom} ${eleve.prenoms}`,
                                                        )
                                                        .join(", ") ||
                                                        "Aucun élève associé"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        parent.actif
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {parent.actif
                                                        ? "Actif"
                                                        : "Désactivé"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500">
                            {parents.from || 0} à {parents.to || 0} sur{" "}
                            {parents.total} parent(s)
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {parents.links.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    className={`rounded-lg border px-3 py-2 text-sm ${
                                        link.active
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700"
                                    } disabled:opacity-40`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
