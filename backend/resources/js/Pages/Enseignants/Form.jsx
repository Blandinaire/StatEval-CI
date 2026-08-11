import { Link } from "@inertiajs/react";

export default function Form({
    data,
    setData,
    etablissements,
    matieres,
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
                        👤 Informations personnelles
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    <div>
                        <label className="block font-semibold mb-2">Nom</label>

                        <input
                            type="text"
                            value={data.nom}
                            onChange={(e) => setData("nom", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.nom && (
                            <p className="text-red-600 text-sm">{errors.nom}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Prénoms
                        </label>

                        <input
                            type="text"
                            value={data.prenoms}
                            onChange={(e) => setData("prenoms", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.prenoms && (
                            <p className="text-red-600 text-sm">
                                {errors.prenoms}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block font-semibold mb-2">Sexe</label>

                        <select
                            value={data.sexe}
                            onChange={(e) => setData("sexe", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Choisir...</option>

                            <option value="Masculin">Masculin</option>

                            <option value="Féminin">Féminin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
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
                        <label className="block font-semibold mb-2">
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
                        <label className="block font-semibold mb-2">
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
                    </div>
                </div>
            </div>
            {/* ===========================
    COORDONNÉES
=========================== */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">📞 Coordonnées</h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    <div>
                        <label className="block font-semibold mb-2">
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

                        {errors.telephone && (
                            <p className="text-red-600 text-sm">
                                {errors.telephone}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.email && (
                            <p className="text-red-600 text-sm">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="col-span-2">
                        <label className="block font-semibold mb-2">
                            Adresse
                        </label>

                        <textarea
                            rows="3"
                            value={data.adresse}
                            onChange={(e) => setData("adresse", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.adresse && (
                            <p className="text-red-600 text-sm">
                                {errors.adresse}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            {/* ===========================
    INFORMATIONS ADMINISTRATIVES
=========================== */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        💼 Informations administratives
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    <div>
                        <label className="block font-semibold mb-2">
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
                            <p className="text-red-600 text-sm">
                                {errors.etablissement_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Matricule interne
                        </label>

                        <input
                            type="text"
                            value={data.matricule}
                            onChange={(e) =>
                                setData("matricule", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.matricule && (
                            <p className="text-red-600 text-sm">
                                {errors.matricule}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Matricule Fonction Publique
                        </label>

                        <input
                            type="text"
                            value={data.matricule_fonction_publique}
                            onChange={(e) =>
                                setData(
                                    "matricule_fonction_publique",
                                    e.target.value,
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Type d'enseignant
                        </label>

                        <select
                            value={data.type}
                            onChange={(e) => setData("type", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="Permanent">Permanent</option>

                            <option value="Vacataire">Vacataire</option>

                            <option value="Contractuel">Contractuel</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
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
                        <label className="block font-semibold mb-2">
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
    INFORMATIONS PÉDAGOGIQUES
=========================== */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        📚 Informations pédagogiques
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    <div>
                        <label className="block font-semibold mb-2">
                            Matière principale
                        </label>

                        <select
                            value={data.matiere_principale_id}
                            onChange={(e) =>
                                setData("matiere_principale_id", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner...</option>

                            {matieres.map((matiere) => (
                                <option key={matiere.id} value={matiere.id}>
                                    {matiere.libelle}
                                </option>
                            ))}
                        </select>

                        {errors.matiere_principale_id && (
                            <p className="text-sm text-red-600">
                                {errors.matiere_principale_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Matière secondaire
                        </label>

                        <select
                            value={data.matiere_secondaire_id}
                            onChange={(e) =>
                                setData("matiere_secondaire_id", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Aucune</option>

                            {matieres.map((matiere) => (
                                <option key={matiere.id} value={matiere.id}>
                                    {matiere.libelle}
                                </option>
                            ))}
                        </select>

                        {errors.matiere_secondaire_id && (
                            <p className="text-sm text-red-600">
                                {errors.matiere_secondaire_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Volume horaire hebdomadaire
                        </label>

                        <input
                            type="number"
                            value={data.volume_horaire}
                            onChange={(e) =>
                                setData("volume_horaire", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.volume_horaire && (
                            <p className="text-sm text-red-600">
                                {errors.volume_horaire}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Nombre maximal de classes
                        </label>

                        <input
                            type="number"
                            value={data.nb_classes_max}
                            onChange={(e) =>
                                setData("nb_classes_max", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.nb_classes_max && (
                            <p className="text-sm text-red-600">
                                {errors.nb_classes_max}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            {/* ===========================
    STATUT
=========================== */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">⚙️ Statut</h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    <div>
                        <label className="block font-semibold mb-2">
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
                        <label className="block font-semibold mb-2">
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
                        <label className="block font-semibold mb-2">
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
                            Enseignant actif
                        </label>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-4">
                <Link
                    href={route("enseignants.index")}
                    className="rounded-lg border px-6 py-3"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
