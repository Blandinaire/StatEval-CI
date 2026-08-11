import { Link } from "@inertiajs/react";

import axios from "axios";
import { useEffect, useState } from "react";

export default function Form({
    data,
    setData,
    etablissements,
    annees,
    classes,
    matieres,
    enseignants,
    errors,
    processing,
    submit,
    submitLabel = "Enregistrer",
}) {

    const [enseignantsFiltres, setEnseignantsFiltres] = useState([]);

    useEffect(() => {

    if (!data.matiere_id) {
        setEnseignantsFiltres([]);
        return;
    }

    axios
        .get(route("api.enseignants.matiere", data.matiere_id))
        .then((response) => {

            setEnseignantsFiltres(response.data);

        })
        .catch((error) => {

            console.error(error);

        });

}, [data.matiere_id]);

    return (
        <form onSubmit={submit} className="space-y-8">

            {/* Affectation */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Affectation pédagogique
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">

                    {/* Etablissement */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Etablissement
                        </label>

                        <select
                            value={data.etablissement_id}
                            onChange={(e) =>
                                setData("etablissement_id", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner...</option>

                            {etablissements.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nom}
                                </option>
                            ))}
                        </select>

                        {errors.etablissement_id && (
                            <p className="text-red-600 text-sm">
                                {errors.etablissement_id}
                            </p>
                        )}
                    </div>

                    {/* Année scolaire */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Année scolaire
                        </label>

                        <select
                            value={data.annee_scolaire_id}
                            onChange={(e) =>
                                setData("annee_scolaire_id", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner...</option>

                            {annees.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.libelle}
                                </option>
                            ))}
                        </select>

                        {errors.annee_scolaire_id && (
                            <p className="text-red-600 text-sm">
                                {errors.annee_scolaire_id}
                            </p>
                        )}
                    </div>

                    {/* Classe */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Classe
                        </label>

                        <select
                            value={data.classe_id}
                            onChange={(e) =>
                                setData("classe_id", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner...</option>

                            {classes.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.libelle}
                                </option>
                            ))}
                        </select>

                        {errors.classe_id && (
                            <p className="text-red-600 text-sm">
                                {errors.classe_id}
                            </p>
                        )}
                    </div>

                    {/* Matière */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Matière
                        </label>

                        <select
                            value={data.matiere_id}
                            onChange={(e) =>
                                setData("matiere_id", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner...</option>

                            {matieres.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.libelle}
                                </option>
                            ))}
                        </select>

                        {errors.matiere_id && (
                            <p className="text-red-600 text-sm">
                                {errors.matiere_id}
                            </p>
                        )}
                    </div>

                    {/* Enseignant */}
                    <div className="col-span-2">
                        <label className="block font-semibold mb-2">
                            Enseignant
                        </label>

                        <select
                            value={data.enseignant_id}
                            onChange={(e) =>
                                setData("enseignant_id", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner...</option>

                            {enseignantsFiltres.map((enseignant) => (
                                <option key={enseignant.id} value={enseignant.id}>
                                    {enseignant.nom} {enseignant.prenoms}
                                </option>
                            ))}
                        </select>

                        {errors.enseignant_id && (
                            <p className="text-red-600 text-sm">
                                {errors.enseignant_id}
                            </p>
                        )}
                    </div>

                </div>
            </div>

            {/* Paramètres */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        Paramètres
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">

                    <div>
                        <label className="block font-semibold mb-2">
                            Coefficient
                        </label>

                        <input
                            type="number"
                            step="0.5"
                            value={data.coefficient}
                            onChange={(e) =>
                                setData("coefficient", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Volume horaire
                        </label>

                        <input
                            type="number"
                            value={data.volume_horaire}
                            onChange={(e) =>
                                setData("volume_horaire", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.actif}
                                onChange={(e) =>
                                    setData("actif", e.target.checked)
                                }
                            />

                            Affectation active
                        </label>
                    </div>

                </div>
            </div>

            <div className="flex justify-end gap-4">

                <Link
                    href={route("affectations.index")}
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