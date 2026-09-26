import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    Pencil,
    Trash2,
    Plus,
    Save,
    RotateCcw,
} from "lucide-react";
import ResponsiveTable from "@/Components/ResponsiveTable";

export default function Index({ maquette, lignes }) {
    const lignesTriees = useMemo(
        () => [...lignes].sort((a, b) => Number(a.ordre) - Number(b.ordre)),
        [lignes],
    );

    const [lignesLocales, setLignesLocales] = useState(lignesTriees);
    const [ordreInitial, setOrdreInitial] = useState(
        lignesTriees.map((ligne) => ligne.id),
    );
    const [enregistrement, setEnregistrement] = useState(false);

    /*
     * Synchroniser l'état local lorsque les données du serveur
     * changent, notamment après une sauvegarde réussie.
     */
    useEffect(() => {
        const nouvellesLignes = [...lignes].sort(
            (a, b) => Number(a.ordre) - Number(b.ordre),
        );

        setLignesLocales(nouvellesLignes);
        setOrdreInitial(nouvellesLignes.map((ligne) => ligne.id));
    }, [lignes]);

    const totalCoefficient = lignesLocales.reduce(
        (total, ligne) => total + Number(ligne.coefficient || 0),
        0,
    );

    const totalVolumeHoraire = lignesLocales.reduce(
        (total, ligne) => total + Number(ligne.volume_horaire || 0),
        0,
    );

    const ordreActuel = lignesLocales.map((ligne) => ligne.id);

    const ordreModifie =
        JSON.stringify(ordreActuel) !== JSON.stringify(ordreInitial);

    /*
     * Déplacement local vers le haut.
     */
    function monter(index) {
        if (index <= 0) return;

        setLignesLocales((precedentes) => {
            const nouvelles = [...precedentes];

            [nouvelles[index - 1], nouvelles[index]] = [
                nouvelles[index],
                nouvelles[index - 1],
            ];

            return nouvelles;
        });
    }

    /*
     * Déplacement local vers le bas.
     */
    function descendre(index) {
        if (index >= lignesLocales.length - 1) return;

        setLignesLocales((precedentes) => {
            const nouvelles = [...precedentes];

            [nouvelles[index], nouvelles[index + 1]] = [
                nouvelles[index + 1],
                nouvelles[index],
            ];

            return nouvelles;
        });
    }

    /*
     * Enregistrement global de l'ordre.
     */
    function enregistrerOrdre() {
        console.log("Clic sur Valider le classement");
        console.log("ordreModifie :", ordreModifie);
        console.log("enregistrement :", enregistrement);
        console.log("ordreActuel :", ordreActuel);

        if (!ordreModifie || enregistrement) {
            console.warn("Enregistrement interrompu par la condition.");
            return;
        }

        const url = route("maquettes.matieres.ordre", maquette.id);

        console.log("URL appelée :", url);

        setEnregistrement(true);

        router.put(
            url,
            { ordre: ordreActuel },
            {
                preserveScroll: true,

                onSuccess: () => {
                    console.log("Enregistrement réussi");
                    setOrdreInitial([...ordreActuel]);
                },

                onError: (errors) => {
                    console.error("Erreurs retournées :", errors);
                },

                onFinish: () => {
                    console.log("Requête terminée");
                    setEnregistrement(false);
                },
            },
        );
    }

    /*
     * Annuler les déplacements non enregistrés.
     */
    function annulerOrdre() {
        if (enregistrement) return;

        const lignesParId = new Map(
            lignesLocales.map((ligne) => [ligne.id, ligne]),
        );

        const lignesInitiales = ordreInitial
            .map((id) => lignesParId.get(id))
            .filter(Boolean);

        setLignesLocales(lignesInitiales);
    }

    function supprimer(ligne) {
        const confirmation = window.confirm(
            `Voulez-vous vraiment supprimer la matière "${ligne.matiere?.libelle}" de cette maquette ?`,
        );

        if (!confirmation) return;

        router.delete(
            route("maquettes.matieres.destroy", [maquette.id, ligne.id]),
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <AdminLayout>
            <Head title={`${maquette.libelle} - Matières`} />

            <div className="space-y-6">
                {/* En-tête */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {maquette.libelle}
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Gestion et organisation des matières de la maquette
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={route("maquettes.index")}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            <ArrowLeft size={18} />
                            Retour
                        </Link>

                        <Link
                            href={route(
                                "maquettes.matieres.create",
                                maquette.id,
                            )}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                        >
                            <Plus size={20} />
                            Ajouter une matière
                        </Link>
                    </div>
                </div>

                {/* Informations sur la maquette */}
                <div className="grid grid-cols-1 gap-4 rounded-xl border bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="text-sm text-gray-500">Niveau</p>
                        <p className="font-semibold text-gray-900">
                            {maquette.niveau?.libelle ?? "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Cycle</p>
                        <p className="font-semibold text-gray-900">
                            {maquette.cycle?.libelle ?? "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Série</p>
                        <p className="font-semibold text-gray-900">
                            {maquette.serie?.libelle ?? "Aucune"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Nombre de matières
                        </p>
                        <p className="font-semibold text-gray-900">
                            {lignesLocales.length}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Total des coefficients
                        </p>
                        <p className="font-semibold text-blue-700">
                            {totalCoefficient.toFixed(2)}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Total du volume horaire
                        </p>
                        <p className="font-semibold text-blue-700">
                            {totalVolumeHoraire.toFixed(2)} h
                        </p>
                    </div>
                </div>

                {/* Tableau */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Matières de la maquette
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Utilisez les flèches pour organiser les
                                matières, puis enregistrez votre classement.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {ordreModifie && (
                                <span className="text-sm font-medium text-amber-600">
                                    Ordre non enregistré
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={annulerOrdre}
                                disabled={!ordreModifie || enregistrement}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <RotateCcw size={16} />
                                Annuler
                            </button>

                            <button
                                type="button"
                                onClick={enregistrerOrdre}
                                disabled={!ordreModifie || enregistrement}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Save size={16} />
                                {enregistrement
                                    ? "Enregistrement..."
                                    : "Enregistrer l’ordre"}
                            </button>
                        </div>
                    </div>

                    <ResponsiveTable minWidth="700px">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                    Ordre
                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                    Matière
                                </th>

                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                    Coefficient
                                </th>

                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                    Volume horaire
                                </th>

                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                    Note sur
                                </th>

                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                    Statut
                                </th>

                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {lignesLocales.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        <p className="text-lg font-medium">
                                            Aucune matière ajoutée
                                        </p>

                                        <p className="mt-1 text-sm">
                                            Commencez par ajouter les matières
                                            de cette maquette pédagogique.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                lignesLocales.map((ligne, index) => (
                                    <tr
                                        key={ligne.id}
                                        className="border-t transition hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700">
                                                {index + 1}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 font-medium text-gray-900">
                                            {ligne.matiere?.libelle ?? "-"}
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                            {ligne.coefficient}
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                            {ligne.volume_horaire} h
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                            {ligne.note_sur}
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                            {ligne.obligatoire ? (
                                                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                    Obligatoire
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                                    Optionnelle
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        monter(index)
                                                    }
                                                    disabled={
                                                        index === 0 ||
                                                        enregistrement
                                                    }
                                                    className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"
                                                    title="Monter"
                                                >
                                                    <ArrowUp size={18} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        descendre(index)
                                                    }
                                                    disabled={
                                                        index ===
                                                            lignesLocales.length -
                                                                1 ||
                                                        enregistrement
                                                    }
                                                    className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"
                                                    title="Descendre"
                                                >
                                                    <ArrowDown size={18} />
                                                </button>

                                                <Link
                                                    href={route(
                                                        "maquettes.matieres.edit",
                                                        [maquette.id, ligne.id],
                                                    )}
                                                    className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    title="Modifier"
                                                >
                                                    <Pencil size={18} />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        supprimer(ligne)
                                                    }
                                                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </ResponsiveTable>

                    {/* Bouton de validation en bas du tableau */}
                    {lignesLocales.length > 0 && (
                        <div className="flex flex-col gap-3 border-t bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-500">
                                {ordreModifie
                                    ? "Des changements restent à enregistrer."
                                    : "Le classement est à jour."}
                            </p>

                            <button
                                type="button"
                                onClick={enregistrerOrdre}
                                disabled={!ordreModifie || enregistrement}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Save size={18} />
                                {enregistrement
                                    ? "Enregistrement..."
                                    : "Valider le classement"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
