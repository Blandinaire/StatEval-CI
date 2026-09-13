import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({ etablissement, responsables = [] }) {
    /*
    |----------------------------------------------------------------------
    | FORMATAGE DE LA CIVILITÉ
    |----------------------------------------------------------------------
    */

    function formatCivilite(civilite) {
        if (!civilite) {
            return "";
        }

        const valeur = civilite.trim().toLowerCase();

        if (valeur === "monsieur" || valeur === "m" || valeur === "m.") {
            return "M.";
        }

        if (valeur === "madame" || valeur === "mme" || valeur === "mme.") {
            return "Mme";
        }

        return civilite;
    }

    /*
    |----------------------------------------------------------------------
    | SUPPRESSION
    |----------------------------------------------------------------------
    */

    function supprimer(id) {
        if (confirm("Voulez-vous vraiment supprimer ce responsable ?")) {
            router.delete(
                route("etablissements.responsables.destroy", [
                    etablissement.id,
                    id,
                ]),
            );
        }
    }

    return (
        <AdminLayout>
            <Head title="Responsables de l'établissement" />

            <div className="mx-auto max-w-7xl">
                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    {/* TITRE */}

                    <div>
                        <div className="mb-3">
                            <Link
                                href={route("etablissements.index")}
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-medium
                                    text-blue-600
                                    hover:text-blue-800
                                "
                            >
                                ← Retour à la fiche établissement
                            </Link>
                        </div>

                        <span className="text-sm text-slate-500">
                            Établissement
                        </span>

                        <h1 className="mt-1 text-3xl font-bold text-slate-800">
                            Responsables
                        </h1>

                        <p className="mt-1 text-slate-500">
                            {etablissement.nom}
                        </p>
                    </div>

                    {/* AJOUT RESPONSABLE */}

                    <Link
                        href={route(
                            "etablissements.responsables.create",
                            etablissement.id,
                        )}
                        className="
                            inline-flex
                            items-center
                            justify-center
                            rounded-lg
                            bg-blue-600
                            px-5
                            py-3
                            font-semibold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-blue-700
                        "
                    >
                        + Ajouter un responsable
                    </Link>
                </div>

                {/* =====================================================
                    INFORMATION
                ===================================================== */}

                <div className="mb-6 mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
                    <h2 className="font-semibold text-blue-800">
                        Gestion de l'équipe dirigeante
                    </h2>

                    <p className="mt-1 text-sm text-blue-700">
                        Ajoutez et gérez les différents responsables de votre
                        établissement : fondateur, directeur, censeur,
                        administrateur, secrétaire, économe et autres
                        responsables.
                    </p>
                </div>

                {/* =====================================================
                    TABLEAU
                ===================================================== */}

                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-4 text-left">
                                        Responsable
                                    </th>

                                    <th className="p-4 text-left">Fonction</th>

                                    <th className="p-4 text-left">Contacts</th>

                                    <th className="p-4 text-center">Statut</th>

                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {responsables.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-12 text-center text-gray-500"
                                        >
                                            <div className="mb-3 text-4xl">
                                                👥
                                            </div>

                                            <p className="font-medium">
                                                Aucun responsable enregistré.
                                            </p>

                                            <p className="mt-1 text-sm">
                                                Commencez par ajouter un
                                                responsable.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    responsables.map((responsable) => (
                                        <tr
                                            key={responsable.id}
                                            className="border-t transition hover:bg-gray-50"
                                        >
                                            {/* =================================
                                                RESPONSABLE
                                            ================================= */}

                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {/* AVATAR */}

                                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                                        {responsable.nom
                                                            ?.charAt(0)
                                                            ?.toUpperCase()}

                                                        {responsable.prenoms
                                                            ?.charAt(0)
                                                            ?.toUpperCase()}
                                                    </div>

                                                    {/* IDENTITÉ */}

                                                    <div>
                                                        <h3 className="font-semibold text-slate-800">
                                                            {formatCivilite(
                                                                responsable.civilite,
                                                            ) && (
                                                                <>
                                                                    {formatCivilite(
                                                                        responsable.civilite,
                                                                    )}{" "}
                                                                </>
                                                            )}

                                                            {responsable.nom}
                                                        </h3>

                                                        {responsable.prenoms && (
                                                            <p className="text-sm text-slate-500">
                                                                {
                                                                    responsable.prenoms
                                                                }
                                                            </p>
                                                        )}

                                                        {responsable.principal && (
                                                            <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                                                                Responsable
                                                                principal
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* =================================
                                                FONCTION
                                            ================================= */}

                                            <td className="p-4">
                                                <span className="font-medium text-gray-700">
                                                    {responsable.fonction ||
                                                        "Non renseignée"}
                                                </span>
                                            </td>

                                            {/* =================================
                                                CONTACTS
                                            ================================= */}

                                            <td className="p-4 text-sm">
                                                <div className="space-y-1">
                                                    {responsable.telephone && (
                                                        <div>
                                                            📞{" "}
                                                            {
                                                                responsable.telephone
                                                            }
                                                        </div>
                                                    )}

                                                    {responsable.whatsapp && (
                                                        <div className="text-green-700">
                                                            WhatsApp :{" "}
                                                            {
                                                                responsable.whatsapp
                                                            }
                                                        </div>
                                                    )}

                                                    {responsable.email && (
                                                        <div className="break-all text-gray-500">
                                                            {responsable.email}
                                                        </div>
                                                    )}

                                                    {!responsable.telephone &&
                                                        !responsable.whatsapp &&
                                                        !responsable.email && (
                                                            <span className="text-gray-400">
                                                                Aucun contact
                                                            </span>
                                                        )}
                                                </div>
                                            </td>

                                            {/* =================================
                                                STATUT
                                            ================================= */}

                                            <td className="p-4 text-center">
                                                {responsable.actif ? (
                                                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                                                        Actif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                                                        Inactif
                                                    </span>
                                                )}
                                            </td>

                                            {/* =================================
                                                ACTIONS
                                            ================================= */}

                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <Link
                                                        href={route(
                                                            "etablissements.responsables.edit",
                                                            [
                                                                etablissement.id,
                                                                responsable.id,
                                                            ],
                                                        )}
                                                        className="
                                                            rounded-lg
                                                            bg-blue-600
                                                            px-4
                                                            py-2
                                                            text-white
                                                            transition
                                                            hover:bg-blue-700
                                                        "
                                                    >
                                                        Modifier
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            supprimer(
                                                                responsable.id,
                                                            )
                                                        }
                                                        className="
                                                            rounded-lg
                                                            bg-red-600
                                                            px-4
                                                            py-2
                                                            text-white
                                                            transition
                                                            hover:bg-red-700
                                                        "
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
