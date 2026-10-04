import AdminLayout from "@/Layouts/AdminLayout";
import {
    Head,
    Link,
    router,
    usePage,
} from "@inertiajs/react";
import {
    Plus,
    Eye,
    BookOpen,
    Trash2,
    Power,
} from "lucide-react";

export default function Index({
    maquettes = {
        data: [],
    },
}) {
    const { auth = {} } = usePage().props;

    const user = auth?.user;

    const role =
        user?.roles?.[0]?.name ??
        user?.role ??
        "Utilisateur";

    const isSuperAdmin =
        role === "SuperAdmin";

    const listeMaquettes =
        Array.isArray(maquettes?.data)
            ? maquettes.data
            : [];

    function supprimer(maquette) {
        const utilisee =
            Number(maquette.classes_count || 0) > 0;

        const message = utilisee
            ? `Cette version est utilisée par ${maquette.classes_count} classe(s) et ne peut pas être supprimée.`
            : `Voulez-vous vraiment supprimer la version V${maquette.version} de « ${maquette.libelle} » ?\n\nCette opération est irréversible.`;

        if (utilisee) {
            window.alert(message);
            return;
        }

        if (!window.confirm(message)) {
            return;
        }

        router.delete(
            route(
                "maquettes.destroy",
                maquette.id,
            ),
        );
    }

    function basculerActive(maquette) {
        router.patch(
            route(
                "maquettes.toggle-active",
                maquette.id,
            ),
            {},
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <AdminLayout>
            <Head title="Maquettes pédagogiques" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Maquettes pédagogiques
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Référentiel pédagogique global et gestion
                            des différentes variantes par niveau.
                        </p>
                    </div>

                    {isSuperAdmin && (
                        <Link
                            href={route(
                                "maquettes.create",
                            )}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                            <Plus size={18} />
                            Nouvelle maquette
                        </Link>
                    )}
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                        Une même maquette peut comporter plusieurs versions
                        actives. Les établissements choisiront la version
                        adaptée lors de la création de leurs classes.
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                        Maquette
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                        Année
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                        Niveau
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                        Série
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                                        Version
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                        Variante
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                                        Statut
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                                        Matières
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                                        Classes
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {listeMaquettes.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <BookOpen
                                                size={40}
                                                className="mx-auto mb-3 text-gray-300"
                                            />

                                            <p className="text-lg font-medium">
                                                Aucune maquette pédagogique
                                            </p>

                                            <p className="mt-1 text-sm">
                                                Aucune maquette n'a encore
                                                été créée.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    listeMaquettes.map(
                                        (maquette) => (
                                            <tr
                                                key={
                                                    maquette.id
                                                }
                                                className="border-b transition hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-gray-900">
                                                        {maquette.libelle ??
                                                            "-"}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {
                                                        maquette
                                                            .annee_scolaire
                                                            ?.libelle
                                                    }
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {
                                                        maquette
                                                            .niveau
                                                            ?.libelle
                                                    }
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {maquette
                                                        .serie
                                                        ?.libelle ??
                                                        "Aucune"}
                                                </td>

                                                <td className="px-5 py-4 text-center">
                                                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                                        V
                                                        {maquette.version ??
                                                            1}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-gray-800">
                                                        {maquette.nom_version ??
                                                            "Standard"}
                                                    </p>

                                                    {maquette.description && (
                                                        <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                                                            {
                                                                maquette.description
                                                            }
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-center">
                                                    {maquette.active ? (
                                                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-center text-sm font-semibold text-gray-700">
                                                    {maquette.lignes_count ??
                                                        0}
                                                </td>

                                                <td className="px-5 py-4 text-center text-sm font-semibold text-gray-700">
                                                    {maquette.classes_count ??
                                                        0}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link
                                                            href={route(
                                                                "maquettes.show",
                                                                maquette.id,
                                                            )}
                                                            title="Voir"
                                                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>

                                                        {isSuperAdmin && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    basculerActive(
                                                                        maquette,
                                                                    )
                                                                }
                                                                title={
                                                                    maquette.active
                                                                        ? "Désactiver"
                                                                        : "Activer"
                                                                }
                                                                className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                                                            >
                                                                <Power
                                                                    size={18}
                                                                />
                                                            </button>
                                                        )}

                                                        {isSuperAdmin && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    supprimer(
                                                                        maquette,
                                                                    )
                                                                }
                                                                title={
                                                                    maquette.classes_count >
                                                                    0
                                                                        ? "Suppression impossible : version utilisée"
                                                                        : "Supprimer"
                                                                }
                                                                className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                                                            >
                                                                <Trash2
                                                                    size={18}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {maquettes?.links &&
                    maquettes.links.length > 3 && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {maquettes.links.map(
                                (link, index) => (
                                    <Link
                                        key={index}
                                        href={
                                            link.url ?? "#"
                                        }
                                        preserveScroll
                                        className={`rounded-lg px-4 py-2 text-sm transition ${
                                            link.active
                                                ? "bg-blue-600 text-white"
                                                : "border bg-white text-gray-700 hover:bg-gray-50"
                                        } ${
                                            !link.url
                                                ? "pointer-events-none opacity-50"
                                                : ""
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    )}
            </div>
        </AdminLayout>
    );
}