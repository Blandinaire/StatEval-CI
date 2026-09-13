import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ etablissement, responsable }) {
    const fonctions = [
        "Fondateur",
        "Co-fondateur",
        "Président du Conseil d'administration",
        "Directeur général",
        "Directeur",
        "Directeur des études",
        "Censeur",
        "Censeur adjoint",
        "Administrateur",
        "Administrateur adjoint",
        "Secrétaire général",
        "Secrétaire",
        "Économe",
        "Comptable",
        "Surveillant général",
        "Responsable pédagogique",
        "Responsable informatique",
        "Responsable des examens",
        "Responsable de la discipline",
        "Responsable de la vie scolaire",
        "Responsable des transports",
        "Responsable de la cantine",
        "Responsable de la communication",
        "Autre",
    ];

    const fonctionExiste = fonctions.includes(responsable.fonction);

    const { data, setData, put, transform, processing, errors } = useForm({
        civilite: responsable.civilite ?? "",

        nom: responsable.nom ?? "",

        prenoms: responsable.prenoms ?? "",

        fonction: fonctionExiste ? responsable.fonction : "Autre",

        fonction_personnalisee: fonctionExiste
            ? ""
            : (responsable.fonction ?? ""),

        telephone: responsable.telephone ?? "",

        whatsapp: responsable.whatsapp ?? "",

        email: responsable.email ?? "",

        actif: Boolean(responsable.actif),

        principal: Boolean(responsable.principal),
    });

    function submit(e) {
        e.preventDefault();

        transform((data) => ({
            ...data,

            fonction:
                data.fonction === "Autre"
                    ? data.fonction_personnalisee
                    : data.fonction,
        }));

        put(
            route("etablissements.responsables.update", [
                etablissement.id,
                responsable.id,
            ]),
        );
    }

    return (
        <AdminLayout>
            <Head title="Modifier un responsable" />

            <div className="max-w-5xl mx-auto">
                {/* EN-TÊTE */}

                <div className="mb-8">
                    <Link
                        href={route(
                            "etablissements.responsables.index",
                            etablissement.id,
                        )}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
                    >
                        ← Retour aux responsables
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-800">
                        Modifier le responsable
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Modification des informations de{" "}
                        <span className="font-semibold">
                            {responsable.nom_complet}
                        </span>
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="bg-white rounded-xl shadow overflow-hidden"
                >
                    {/* IDENTITÉ */}

                    <div className="p-8 border-b">
                        <h2 className="text-xl font-bold text-gray-800">
                            Informations personnelles
                        </h2>

                        <p className="text-sm text-gray-500 mt-1 mb-6">
                            Identité du responsable.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CIVILITÉ */}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Civilité
                                </label>

                                <select
                                    value={data.civilite}
                                    onChange={(e) =>
                                        setData("civilite", e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Sélectionner</option>

                                    <option value="M.">Monsieur</option>

                                    <option value="Mme">Madame</option>

                                    <option value="Mlle">Mademoiselle</option>
                                </select>
                            </div>

                            {/* NOM */}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nom *
                                </label>

                                <input
                                    type="text"
                                    value={data.nom}
                                    onChange={(e) =>
                                        setData("nom", e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />

                                {errors.nom && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.nom}
                                    </p>
                                )}
                            </div>

                            {/* PRÉNOMS */}

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Prénoms *
                                </label>

                                <input
                                    type="text"
                                    value={data.prenoms}
                                    onChange={(e) =>
                                        setData("prenoms", e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />

                                {errors.prenoms && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.prenoms}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* FONCTION */}

                    <div className="p-8 border-b">
                        <h2 className="text-xl font-bold text-gray-800">
                            Fonction dans l'établissement
                        </h2>

                        <p className="text-sm text-gray-500 mt-1 mb-6">
                            Poste ou responsabilité exercée.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Fonction *
                                </label>

                                <select
                                    value={data.fonction}
                                    onChange={(e) => {
                                        setData("fonction", e.target.value);

                                        if (e.target.value !== "Autre") {
                                            setData(
                                                "fonction_personnalisee",
                                                "",
                                            );
                                        }
                                    }}
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Sélectionner une fonction
                                    </option>

                                    {fonctions.map((fonction) => (
                                        <option key={fonction} value={fonction}>
                                            {fonction}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {data.fonction === "Autre" && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Fonction personnalisée *
                                    </label>

                                    <input
                                        type="text"
                                        value={data.fonction_personnalisee}
                                        onChange={(e) =>
                                            setData(
                                                "fonction_personnalisee",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                        </div>

                        {errors.fonction && (
                            <p className="text-red-600 text-sm mt-3">
                                {errors.fonction}
                            </p>
                        )}
                    </div>

                    {/* CONTACTS */}

                    <div className="p-8 border-b">
                        <h2 className="text-xl font-bold text-gray-800">
                            Coordonnées
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Téléphone
                                </label>

                                <input
                                    type="text"
                                    value={data.telephone}
                                    onChange={(e) =>
                                        setData("telephone", e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    WhatsApp
                                </label>

                                <input
                                    type="text"
                                    value={data.whatsapp}
                                    onChange={(e) =>
                                        setData("whatsapp", e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Adresse e-mail
                                </label>

                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />

                                {errors.email && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* STATUT */}

                    <div className="p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Statut
                        </h2>

                        <div className="space-y-5">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.actif}
                                    onChange={(e) =>
                                        setData("actif", e.target.checked)
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />

                                <div>
                                    <div className="font-semibold text-gray-700">
                                        Responsable actif
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        Cette personne exerce actuellement cette
                                        fonction.
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.principal}
                                    onChange={(e) =>
                                        setData("principal", e.target.checked)
                                    }
                                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                />

                                <div>
                                    <div className="font-semibold text-gray-700">
                                        Responsable principal
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        Une seule personne peut être définie
                                        comme responsable principal.
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="bg-gray-50 border-t px-8 py-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <Link
                            href={route(
                                "etablissements.responsables.index",
                                etablissement.id,
                            )}
                            className="inline-flex justify-center px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                        >
                            Annuler
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`inline-flex justify-center px-6 py-3 rounded-lg text-white transition ${
                                processing
                                    ? "bg-blue-400 cursor-wait"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {processing
                                ? "Enregistrement..."
                                : "Enregistrer les modifications"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
