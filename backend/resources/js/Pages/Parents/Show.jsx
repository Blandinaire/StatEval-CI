import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Show({ parent, enfants }) {
    return (
        <AdminLayout>
            <Head title={`Compte parent - ${parent.name}`} />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* EN-TÊTE */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Détail du compte parent
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Informations du responsable et liste de ses enfants.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={route("parents.edit", parent.id)}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                        >
                            Modifier
                        </Link>

                        <Link
                            href={route("parents.index")}
                            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Retour à la liste
                        </Link>
                    </div>
                </div>

                {/* INFORMATIONS DU PARENT */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="border-b bg-slate-50 px-6 py-4">
                        <h2 className="font-bold text-gray-800">
                            Informations du parent
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-sm text-gray-500">
                                Nom et prénoms
                            </p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {parent.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Téléphone
                            </p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {parent.telephone || "Non renseigné"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Adresse e-mail
                            </p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {parent.email || "Non renseignée"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Établissement
                            </p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {parent.etablissement || "Non renseigné"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Statut du compte
                            </p>
                            <span
                                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                    parent.actif
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {parent.actif ? "Actif" : "Désactivé"}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Type de création
                            </p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {parent.genere_automatiquement
                                    ? "Génération automatique"
                                    : "Création manuelle"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Date de création
                            </p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {parent.created_at || "Non disponible"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ENFANTS ASSOCIÉS */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-6 py-4">
                        <div>
                            <h2 className="font-bold text-gray-800">
                                Enfants associés au compte
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Liste des élèves rattachés à ce parent.
                            </p>
                        </div>

                        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                            {enfants.length} enfant(s)
                        </span>
                    </div>

                    {enfants.length === 0 ? (
                        <div className="p-10 text-center">
                            <p className="font-semibold text-gray-700">
                                Aucun enfant associé à ce compte.
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Ce compte parent ne possède actuellement aucune
                                association avec une fiche élève.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {[
                                            "N°",
                                            "Matricule",
                                            "Nom et prénoms",
                                            "Niveau",
                                            "Classe",
                                            "Lien avec le parent",
                                            "Statut",
                                        ].map((titre) => (
                                            <th
                                                key={titre}
                                                className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600"
                                            >
                                                {titre}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {enfants.map((eleve, index) => (
                                        <tr
                                            key={eleve.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4 text-sm text-gray-500">
                                                {index + 1}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-medium text-gray-800">
                                                {eleve.matricule || "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-gray-800">
                                                    {eleve.nom} {eleve.prenoms}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {eleve.sexe || ""}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-700">
                                                {eleve.niveau || "Non renseigné"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                                                    {eleve.classe || "Non affecté"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-700">
                                                {eleve.lien || "Non renseigné"}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-700">
                                                {eleve.statut || "Non renseigné"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
