import AdminLayout from "@/Layouts/AdminLayout";
import ResponsiveTable from "@/Components/ResponsiveTable";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({
    personnels = [],
    fonctions = [],
    etablissements = [],
    filtres = {},
    etablissementSelectionne = null,
    isSuperAdmin = false,
}) {
    const appliquerFiltres = (e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const params = Object.fromEntries(formData.entries());

        Object.keys(params).forEach((key) => {
            if (!params[key]) {
                delete params[key];
            }
        });

        router.get(route("autres-personnels.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Autres personnels" />

            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Autres personnels
                        </h1>
                        <p className="text-gray-500">
                            Gestion du personnel administratif et technique
                        </p>
                    </div>

                    <Link
                        href={route("autres-personnels.create")}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-center text-white hover:bg-blue-700"
                    >
                        + Nouveau personnel
                    </Link>
                </div>

                <form
                    onSubmit={appliquerFiltres}
                    className="space-y-4 rounded-xl border bg-white p-4 shadow-sm"
                >
                    <h2 className="font-semibold text-gray-800">Filtres</h2>

                    {isSuperAdmin && (
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Établissement
                            </label>
                            <select
                                name="etablissement_id"
                                defaultValue={etablissementSelectionne ?? ""}
                                className="w-full rounded-lg border-gray-300"
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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Recherche
                            </label>
                            <input
                                type="text"
                                name="recherche"
                                defaultValue={filtres.recherche ?? ""}
                                placeholder="Nom, prénoms ou matricule"
                                className="w-full rounded-lg border-gray-300"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Fonction
                            </label>
                            <select
                                name="fonction_personnel_id"
                                defaultValue={
                                    filtres.fonction_personnel_id ?? ""
                                }
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="">Toutes les fonctions</option>
                                {fonctions.map((fonction) => (
                                    <option
                                        key={fonction.id}
                                        value={fonction.id}
                                    >
                                        {fonction.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Statut
                            </label>
                            <select
                                name="statut"
                                defaultValue={filtres.statut ?? ""}
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="Actif">Actif</option>
                                <option value="Suspendu">Suspendu</option>
                                <option value="En congé">En congé</option>
                                <option value="Parti">Parti</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                        >
                            Rechercher
                        </button>

                        <Link
                            href={route("autres-personnels.index")}
                            className="rounded-lg border px-5 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Réinitialiser
                        </Link>
                    </div>
                </form>

                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <ResponsiveTable minWidth="1000px">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Matricule</th>
                                <th className="p-3 text-left">Nom</th>
                                <th className="p-3 text-left">Prénoms</th>
                                <th className="p-3 text-left">Fonction</th>

                                {isSuperAdmin && (
                                    <th className="p-3 text-left">
                                        Établissement
                                    </th>
                                )}

                                <th className="p-3 text-left">Téléphone</th>
                                <th className="p-3 text-left">Statut</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {personnels.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={isSuperAdmin ? 8 : 7}
                                        className="p-6 text-center text-gray-500"
                                    >
                                        Aucun personnel trouvé.
                                    </td>
                                </tr>
                            ) : (
                                personnels.map((personnel) => (
                                    <tr
                                        key={personnel.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="p-3">
                                            {personnel.matricule || "-"}
                                        </td>
                                        <td className="p-3">{personnel.nom}</td>
                                        <td className="p-3">
                                            {personnel.prenoms}
                                        </td>
                                        <td className="p-3">
                                            {personnel.fonction?.libelle ?? "-"}
                                        </td>

                                        {isSuperAdmin && (
                                            <td className="p-3">
                                                {personnel.etablissement?.nom ??
                                                    "-"}
                                            </td>
                                        )}

                                        <td className="p-3">
                                            {personnel.telephone || "-"}
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    personnel.statut === "Actif"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {personnel.statut}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={route(
                                                        "autres-personnels.show",
                                                        personnel.id,
                                                    )}
                                                    className="rounded bg-gray-600 px-3 py-1 text-white hover:bg-gray-700"
                                                >
                                                    Voir
                                                </Link>

                                                <Link
                                                    href={route(
                                                        "autres-personnels.edit",
                                                        personnel.id,
                                                    )}
                                                    className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                                                >
                                                    Modifier
                                                </Link>
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
