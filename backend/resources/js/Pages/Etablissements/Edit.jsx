import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ etablissement }) {
    const { data, setData, post, processing, errors } = useForm({
        nom: etablissement.nom || "",
        sigle: etablissement.sigle || "",
        code: etablissement.code || "",

        type: etablissement.type || "Privé",

        devise: etablissement.devise || "",
        slogan: etablissement.slogan || "",

        commune: etablissement.commune || "",
        ville: etablissement.ville || "",
        quartier: etablissement.quartier || "",
        adresse: etablissement.adresse || "",

        region: etablissement.region || "",
        direction_regionale: etablissement.direction_regionale || "",
        inspection: etablissement.inspection || "",
        academie: etablissement.academie || "",

        telephone: etablissement.telephone || "",
        telephone_secondaire: etablissement.telephone_secondaire || "",
        whatsapp: etablissement.whatsapp || "",
        email: etablissement.email || "",
        site_web: etablissement.site_web || "",

        logo: null,

        _method: "PUT",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("etablissements.update", etablissement.id), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Modifier la fiche établissement" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* EN-TÊTE */}

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Modifier la fiche établissement
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Mettez à jour les informations de votre
                                établissement.
                            </p>
                        </div>

                        <Link
                            href={route("etablissements.index")}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </Link>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* INFORMATIONS GÉNÉRALES */}

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                                Informations générales
                            </h2>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nom complet
                                    </label>

                                    <input
                                        type="text"
                                        value={data.nom}
                                        onChange={(e) =>
                                            setData("nom", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />

                                    {errors.nom && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.nom}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Sigle
                                    </label>

                                    <input
                                        type="text"
                                        value={data.sigle}
                                        onChange={(e) =>
                                            setData("sigle", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Code établissement
                                    </label>

                                    <input
                                        type="text"
                                        value={data.code}
                                        maxLength="6"
                                        onChange={(e) =>
                                            setData("code", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />

                                    {errors.code && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Type d'établissement
                                    </label>

                                    <select
                                        value={data.type}
                                        onChange={(e) =>
                                            setData("type", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    >
                                        <option value="Public">Public</option>

                                        <option value="Privé">Privé</option>

                                        <option value="Confessionnel">
                                            Confessionnel
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Devise
                                    </label>

                                    <input
                                        type="text"
                                        value={data.devise}
                                        onChange={(e) =>
                                            setData("devise", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Slogan
                                    </label>

                                    <input
                                        type="text"
                                        value={data.slogan}
                                        onChange={(e) =>
                                            setData("slogan", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* LOCALISATION */}

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                                Localisation
                            </h2>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Commune
                                    </label>

                                    <input
                                        type="text"
                                        value={data.commune}
                                        onChange={(e) =>
                                            setData("commune", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Ville
                                    </label>

                                    <input
                                        type="text"
                                        value={data.ville}
                                        onChange={(e) =>
                                            setData("ville", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />

                                    {errors.ville && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.ville}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Quartier
                                    </label>

                                    <input
                                        type="text"
                                        value={data.quartier}
                                        onChange={(e) =>
                                            setData("quartier", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Adresse
                                    </label>

                                    <input
                                        type="text"
                                        value={data.adresse}
                                        onChange={(e) =>
                                            setData("adresse", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CONTACTS */}

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                                Contacts
                            </h2>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Téléphone principal
                                    </label>

                                    <input
                                        type="text"
                                        value={data.telephone}
                                        onChange={(e) =>
                                            setData("telephone", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Téléphone secondaire
                                    </label>

                                    <input
                                        type="text"
                                        value={data.telephone_secondaire}
                                        onChange={(e) =>
                                            setData(
                                                "telephone_secondaire",
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        WhatsApp
                                    </label>

                                    <input
                                        type="text"
                                        value={data.whatsapp}
                                        onChange={(e) =>
                                            setData("whatsapp", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        E-mail
                                    </label>

                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Site web
                                    </label>

                                    <input
                                        type="text"
                                        value={data.site_web}
                                        onChange={(e) =>
                                            setData("site_web", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ADMINISTRATION */}

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                                Administration éducative
                            </h2>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Direction régionale
                                    </label>

                                    <input
                                        type="text"
                                        value={data.direction_regionale}
                                        onChange={(e) =>
                                            setData(
                                                "direction_regionale",
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Inspection / IEPP
                                    </label>

                                    <input
                                        type="text"
                                        value={data.inspection}
                                        onChange={(e) =>
                                            setData(
                                                "inspection",
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Académie
                                    </label>

                                    <input
                                        type="text"
                                        value={data.academie}
                                        onChange={(e) =>
                                            setData("academie", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Région
                                    </label>

                                    <input
                                        type="text"
                                        value={data.region}
                                        onChange={(e) =>
                                            setData("region", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* LOGO */}

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                                Logo de l'établissement
                            </h2>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setData("logo", e.target.files[0])
                                }
                                className="block w-full text-sm text-gray-700"
                            />

                            {errors.logo && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.logo}
                                </p>
                            )}
                        </div>

                        {/* BOUTON */}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing
                                    ? "Enregistrement..."
                                    : "Enregistrer les modifications"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
