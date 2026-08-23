import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { Plus, Eye } from "lucide-react";

export default function Index({ maquettes }) {
    const listeMaquettes = maquettes?.data || [];

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
                            Gérez les maquettes, matières et coefficients
                            pédagogiques.
                        </p>
                    </div>

                    <Link
                        href={route("maquettes.create")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Nouvelle maquette
                    </Link>
                </div>

                {/* =====================================================
                    TABLEAU
                ===================================================== */}

                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                        Libellé
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                        Établissement
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                        Année
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                        Cycle
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                        Niveau
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                        Série
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                                        Version
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {listeMaquettes.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            Aucune maquette pédagogique n'a
                                            encore été créée.
                                        </td>
                                    </tr>
                                ) : (
                                    listeMaquettes.map((maquette) => (
                                        <tr
                                            key={maquette.id}
                                            className="border-b last:border-b-0 hover:bg-slate-50"
                                        >
                                            {/* Libellé */}

                                            <td className="px-5 py-4 font-semibold text-slate-800">
                                                {maquette.libelle || "—"}
                                            </td>

                                            {/* Établissement */}

                                            <td className="px-5 py-4 text-slate-700">
                                                {maquette.etablissement?.nom ||
                                                    "—"}
                                            </td>

                                            {/* Année scolaire */}

                                            <td className="px-5 py-4 text-slate-700">
                                                {maquette.annee_scolaire
                                                    ?.libelle || "—"}
                                            </td>

                                            {/* Cycle */}

                                            <td className="px-5 py-4 text-slate-700">
                                                {maquette.cycle?.libelle || "—"}
                                            </td>

                                            {/* Niveau */}

                                            <td className="px-5 py-4 font-medium text-slate-700">
                                                {maquette.niveau?.libelle ||
                                                    "—"}
                                            </td>

                                            {/* Série */}

                                            <td className="px-5 py-4 text-slate-700">
                                                {maquette.serie?.libelle ||
                                                    "Sans série"}
                                            </td>

                                            {/* Version */}

                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                                                    v{maquette.version || 1}
                                                </span>
                                            </td>

                                            {/* Actions */}

                                            <td className="px-5 py-4">
                                                <div className="flex justify-center">
                                                    <Link
                                                        href={route(
                                                            "maquettes.show",
                                                            maquette.id,
                                                        )}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                                                    >
                                                        <Eye size={17} />
                                                        Voir
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {maquettes?.links && maquettes.links.length > 3 && (
                        <div className="flex flex-wrap gap-2 border-t px-5 py-4">
                            {maquettes.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || "#"}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`rounded-lg px-3 py-2 text-sm ${
                                        link.active
                                            ? "bg-blue-600 text-white"
                                            : link.url
                                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                              : "cursor-not-allowed bg-slate-50 text-slate-300"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
