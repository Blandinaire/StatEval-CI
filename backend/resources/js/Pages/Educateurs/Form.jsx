import { Link } from "@inertiajs/react";

export default function Form({
    data,
    setData,
    etablissements,
    isSuperAdmin,
    errors,
    processing,
    submit,
    submitLabel = "Enregistrer",
}) {
    return (
        <form onSubmit={submit} className="space-y-8">
            {/* ===========================
                INFORMATIONS PERSONNELLES
            ============================ */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Informations personnelles
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block font-semibold">Nom</label>

                        <input
                            type="text"
                            value={data.nom}
                            onChange={(e) => setData("nom", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.nom && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.nom}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Prénoms
                        </label>

                        <input
                            type="text"
                            value={data.prenoms}
                            onChange={(e) => setData("prenoms", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.prenoms && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.prenoms}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">Sexe</label>

                        <select
                            value={data.sexe}
                            onChange={(e) => setData("sexe", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Choisir...</option>
                            <option value="Masculin">Masculin</option>
                            <option value="Féminin">Féminin</option>
                        </select>

                        {errors.sexe && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.sexe}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Date de naissance
                        </label>

                        <input
                            type="date"
                            value={data.date_naissance}
                            onChange={(e) =>
                                setData("date_naissance", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Lieu de naissance
                        </label>

                        <input
                            type="text"
                            value={data.lieu_naissance}
                            onChange={(e) =>
                                setData("lieu_naissance", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Nationalité
                        </label>

                        <input
                            type="text"
                            value={data.nationalite}
                            onChange={(e) =>
                                setData("nationalite", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.nationalite && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.nationalite}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ===========================
                COORDONNÉES
            ============================ */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">Coordonnées</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block font-semibold">
                            Téléphone
                        </label>

                        <input
                            type="text"
                            value={data.telephone}
                            onChange={(e) =>
                                setData("telephone", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Email
                        </label>

                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block font-semibold">
                            Adresse
                        </label>

                        <textarea
                            rows="3"
                            value={data.adresse}
                            onChange={(e) => setData("adresse", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />
                    </div>
                </div>
            </div>

            {/* ===========================
                INFORMATIONS ADMINISTRATIVES
            ============================ */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Informations administratives
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    {isSuperAdmin && (
                        <div>
                            <label className="mb-2 block font-semibold">
                                Établissement
                            </label>

                            <select
                                value={data.etablissement_id}
                                onChange={(e) =>
                                    setData("etablissement_id", e.target.value)
                                }
                                className="w-full rounded-lg border p-3"
                            >
                                <option value="">Sélectionner...</option>

                                {etablissements.map((etablissement) => (
                                    <option
                                        key={etablissement.id}
                                        value={etablissement.id}
                                    >
                                        {etablissement.nom}
                                    </option>
                                ))}
                            </select>

                            {errors.etablissement_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.etablissement_id}
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block font-semibold">
                            Matricule interne
                        </label>

                        <input
                            type="text"
                            value={data.matricule || "Généré automatiquement"}
                            readOnly
                            className="w-full cursor-not-allowed rounded-lg border bg-gray-100 p-3 text-gray-500"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            Le matricule interne est généré automatiquement par
                            SchoolManager après l'enregistrement.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Type de contrat
                        </label>

                        <select
                            value={data.type}
                            onChange={(e) => setData("type", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="Permanent">Permanent</option>
                            <option value="Contractuel">Contractuel</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Grade
                        </label>

                        <input
                            type="text"
                            value={data.grade}
                            onChange={(e) => setData("grade", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Diplôme
                        </label>

                        <input
                            type="text"
                            value={data.diplome}
                            onChange={(e) => setData("diplome", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />
                    </div>
                </div>
            </div>

            {/* ===========================
                STATUT
            ============================ */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Situation professionnelle
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block font-semibold">
                            Date d'embauche
                        </label>

                        <input
                            type="date"
                            value={data.date_embauche}
                            onChange={(e) =>
                                setData("date_embauche", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Date de prise de service
                        </label>

                        <input
                            type="date"
                            value={data.date_prise_service}
                            onChange={(e) =>
                                setData("date_prise_service", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold">
                            Statut
                        </label>

                        <select
                            value={data.statut}
                            onChange={(e) => setData("statut", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="Actif">Actif</option>
                            <option value="Suspendu">Suspendu</option>
                            <option value="Retraité">Retraité</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.actif}
                                onChange={(e) =>
                                    setData("actif", e.target.checked)
                                }
                            />

                            <span>Éducateur actif</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Link
                    href={route("educateurs.index")}
                    className="rounded-lg border px-6 py-3 hover:bg-gray-50"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
