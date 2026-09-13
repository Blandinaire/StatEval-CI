import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { Plus, Eye, BookOpen } from "lucide-react";
import ResponsiveTable from "@/Components/ResponsiveTable";

export default function Index({ maquettes = { data: [] } }) {
    const { auth = {} } = usePage().props;

    const user = auth?.user;

    /*
    |--------------------------------------------------------------------------
    | RÔLE UTILISATEUR
    |--------------------------------------------------------------------------
    */

    const role = user?.roles?.[0]?.name ?? user?.role ?? "Utilisateur";

    const isSuperAdmin = role === "SuperAdmin";

    /*
    |--------------------------------------------------------------------------
    | LISTE DES MAQUETTES
    |--------------------------------------------------------------------------
    */

    const listeMaquettes = Array.isArray(maquettes?.data) ? maquettes.data : [];

    return (
        <AdminLayout>
            <Head title="Maquettes pédagogiques" />

            <div className="space-y-6">
                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Maquettes pédagogiques
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Consultez les maquettes, matières et coefficients
                            pédagogiques disponibles.
                        </p>
                    </div>

                    {isSuperAdmin && (
                        <Link
                            href={route("maquettes.create")}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                            <Plus size={18} />
                            Nouvelle maquette
                        </Link>
                    )}
                </div>

                {/* =====================================================
                    TABLEAU
                ===================================================== */}

                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                        Maquette
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                        Établissement
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                        Année scolaire
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                        Cycle
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                        Niveau
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                        Série
                                    </th>

                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                                        Version
                                    </th>

                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {listeMaquettes.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
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
                                                Aucune maquette n'a encore été
                                                créée.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    listeMaquettes.map((maquette) => (
                                        <tr
                                            key={maquette.id}
                                            className="border-b transition hover:bg-gray-50"
                                        >
                                            {/* Maquette */}

                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">
                                                    {maquette.libelle ?? "-"}
                                                </p>
                                            </td>

                                            {/* Établissement */}

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {maquette.etablissement?.nom ??
                                                    "-"}
                                            </td>

                                            {/* Année scolaire */}

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {maquette.annee_scolaire
                                                    ?.libelle ?? "-"}
                                            </td>

                                            {/* Cycle */}

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {maquette.cycle?.libelle ?? "-"}
                                            </td>

                                            {/* Niveau */}

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {maquette.niveau?.libelle ??
                                                    "-"}
                                            </td>

                                            {/* Série */}

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {maquette.serie?.libelle ??
                                                    "Aucune"}
                                            </td>

                                            {/* Version */}

                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                    V{maquette.version ?? 1}
                                                </span>
                                            </td>

                                            {/* Actions */}

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={route(
                                                            "maquettes.show",
                                                            maquette.id,
                                                        )}
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                        title="Voir la maquette"
                                                    >
                                                        <Eye size={19} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* =====================================================
                    PAGINATION
                ===================================================== */}

                {maquettes?.links && maquettes.links.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-2">
                        {maquettes.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url ?? "#"}
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
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
