import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import axios from "axios";
import nationalites from "./nationalites";
import {
    formatNom,
    formatPrenoms,
    formatTexte,
    formatEmail,
    formatTelephone,
    formatMatricule,
} from "@/Utils/formatters";

export default function Form({
    data,
    setData,
    etablissements,
    annees,
    classes,
    errors,
    processing,
    submit,
    submitLabel = "Enregistrer",
}) {
    const [classesFiltrees, setClassesFiltrees] = useState([]);
    const [chargementClasses, setChargementClasses] = useState(false);

    useEffect(() => {
        // Si l'établissement ou l'année scolaire
        // n'est pas sélectionné, on vide les classes.
        if (!data.etablissement_id || !data.annee_scolaire_id) {
            setClassesFiltrees([]);
            setData("classe_id", "");
            return;
        }

        setChargementClasses(true);

        axios
            .get(route("api.classes.etablissement"), {
                params: {
                    etablissement_id: data.etablissement_id,
                    annee_scolaire_id: data.annee_scolaire_id,
                },
            })
            .then((response) => {
                setClassesFiltrees(response.data);

                // Vérifier si la classe actuellement sélectionnée
                // appartient toujours à la nouvelle liste.
                const classeExiste = response.data.some(
                    (classe) => String(classe.id) === String(data.classe_id),
                );

                if (!classeExiste) {
                    setData("classe_id", "");
                }
            })
            .catch((error) => {
                console.error("Erreur lors du chargement des classes :", error);

                setClassesFiltrees([]);
                setData("classe_id", "");
            })
            .finally(() => {
                setChargementClasses(false);
            });
    }, [data.etablissement_id, data.annee_scolaire_id]);

    return (
        <form onSubmit={submit} className="space-y-8">
            {/* =========================================================
                SCOLARITÉ
            ========================================================= */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">🎓 Scolarité</h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    {/* Établissement */}
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

                            {etablissements.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nom}
                                </option>
                            ))}
                        </select>

                        {errors.etablissement_id && (
                            <p className="mt-1 text-sm text-red-600">
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
                            <p className="mt-1 text-sm text-red-600">
                                {errors.annee_scolaire_id}
                            </p>
                        )}
                    </div>

                    {/* Classe */}
                    <div className="col-span-2">
                        <label className="block font-semibold mb-2">
                            Classe
                        </label>

                        <select
                            value={data.classe_id}
                            onChange={(e) =>
                                setData("classe_id", e.target.value)
                            }
                            disabled={
                                !data.etablissement_id ||
                                !data.annee_scolaire_id ||
                                chargementClasses
                            }
                            className="w-full rounded-lg border p-3 disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                            <option value="">
                                {!data.etablissement_id
                                    ? "Sélectionnez d'abord l'établissement"
                                    : !data.annee_scolaire_id
                                      ? "Sélectionnez d'abord l'année scolaire"
                                      : chargementClasses
                                        ? "Chargement des classes..."
                                        : classesFiltrees.length === 0
                                          ? "Aucune classe disponible"
                                          : "Sélectionner..."}
                            </option>

                            {classesFiltrees.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.libelle}
                                </option>
                            ))}
                        </select>

                        {errors.classe_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.classe_id}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* =========================================================
                IDENTIFICATION
            ========================================================= */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        👤 Identification de l'élève
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    {/* Matricule */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Matricule
                        </label>

                        <input
                            type="text"
                            value={data.matricule}
                            maxLength={9}
                            onChange={(e) =>
                                setData(
                                    "matricule",
                                    formatMatricule(e.target.value),
                                )
                            }
                            placeholder="Ex. 99019942M"
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.matricule && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.matricule}
                            </p>
                        )}

                        <p className="text-xs text-slate-500 mt-1">
                            Format : 8 chiffres suivis d'une lettre majuscule.
                        </p>

                        {errors.matricule && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.matricule}
                            </p>
                        )}

                        <p className="text-xs text-slate-500 mt-1">
                            Format obligatoire : 8 chiffres suivis d'une lettre
                            majuscule.
                        </p>

                        {errors.matricule && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.matricule}
                            </p>
                        )}
                    </div>

                    {/* Nom */}
                    <div>
                        <label className="block font-semibold mb-2">Nom</label>

                        <input
                            type="text"
                            value={data.nom}
                            onChange={(e) =>
                                setData("nom", formatNom(e.target.value))
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.nom && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.nom}
                            </p>
                        )}
                    </div>

                    {/* Prénoms */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Prénoms
                        </label>

                        <input
                            type="text"
                            value={data.prenoms}
                            onChange={(e) =>
                                setData(
                                    "prenoms",
                                    formatPrenoms(e.target.value),
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.prenoms && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.prenoms}
                            </p>
                        )}
                    </div>

                    {/* Sexe */}
                    <div>
                        <label className="block font-semibold mb-2">Sexe</label>

                        <select
                            value={data.sexe}
                            onChange={(e) => setData("sexe", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner...</option>

                            <option value="Masculin">Masculin</option>

                            <option value="Féminin">Féminin</option>
                        </select>

                        {errors.sexe && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.sexe}
                            </p>
                        )}
                    </div>

                    {/* Date de naissance */}
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

                        {errors.date_naissance && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.date_naissance}
                            </p>
                        )}
                    </div>

                    {/* Lieu de naissance */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Lieu de naissance
                        </label>

                        <input
                            type="text"
                            value={data.lieu_naissance}
                            onChange={(e) =>
                                setData(
                                    "lieu_naissance",
                                    formatTexte(e.target.value),
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.lieu_naissance && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.lieu_naissance}
                            </p>
                        )}
                    </div>

                    {/* Nationalité */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Nationalité
                        </label>

                        <select
                            value={data.nationalite}
                            onChange={(e) =>
                                setData("nationalite", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">
                                Sélectionner une nationalité...
                            </option>

                            {nationalites.map((nationalite) => (
                                <option key={nationalite} value={nationalite}>
                                    {nationalite}
                                </option>
                            ))}
                        </select>

                        {errors.nationalite && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.nationalite}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* =========================================================
                COORDONNÉES
            ========================================================= */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">📞 Coordonnées</h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    {/* Téléphone */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Téléphone
                        </label>

                        <input
                            type="text"
                            value={data.telephone}
                            onChange={(e) =>
                                setData(
                                    "telephone",
                                    formatTelephone(e.target.value),
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.telephone && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.telephone}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) =>
                                setData("email", formatEmail(e.target.value))
                            }
                            className="w-full rounded-lg border p-3"
                        />

                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Adresse */}
                    <div className="col-span-2">
                        <label className="block font-semibold mb-2">
                            Adresse
                        </label>

                        <textarea
                            value={data.adresse}
                            onChange={(e) => setData("adresse", e.target.value)}
                            rows="3"
                            className="w-full rounded-lg border p-3"
                        />
                    </div>
                </div>
            </div>

            {/* =========================================================
                SITUATION SCOLAIRE
            ========================================================= */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">📚 Situation scolaire</h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    {/* Régime */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Régime
                        </label>

                        <select
                            value={data.regime}
                            onChange={(e) => setData("regime", e.target.value)}
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner...</option>

                            <option value="Externe">Externe</option>

                            <option value="Demi-pensionnaire">
                                Demi-pensionnaire
                            </option>

                            <option value="Interne">Interne</option>
                        </select>

                        {errors.regime && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.regime}
                            </p>
                        )}
                    </div>

                    {/* Statut */}
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

                            <option value="Transféré">Transféré</option>

                            <option value="Exclu">Exclu</option>

                            <option value="Abandonné">Abandonné</option>

                            <option value="Diplômé">Diplômé</option>
                        </select>

                        {errors.statut && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.statut}
                            </p>
                        )}
                    </div>

                    {/* Redoublant */}
                    <div>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.redoublant}
                                onChange={(e) =>
                                    setData("redoublant", e.target.checked)
                                }
                            />

                            <span className="font-semibold">
                                Élève redoublant
                            </span>
                        </label>
                    </div>

                    {/* Boursier */}
                    <div>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.boursier}
                                onChange={(e) =>
                                    setData("boursier", e.target.checked)
                                }
                            />

                            <span className="font-semibold">
                                Élève boursier
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* =========================================================
                RESPONSABLE LÉGAL
            ========================================================= */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">👨‍👩‍👦 Responsable légal</h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    <div>
                        <label className="block font-semibold mb-2">Nom</label>

                        <input
                            type="text"
                            value={data.responsable_nom}
                            onChange={(e) =>
                                setData(
                                    "responsable_nom",
                                    formatNom(e.target.value),
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Prénoms
                        </label>

                        <input
                            type="text"
                            value={data.responsable_prenoms}
                            onChange={(e) =>
                                setData(
                                    "responsable_prenoms",
                                    formatPrenoms(e.target.value),
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Téléphone
                        </label>

                        <input
                            type="text"
                            value={data.responsable_telephone}
                            onChange={(e) =>
                                setData(
                                    "responsable_telephone",
                                    formatTelephone(e.target.value),
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            value={data.responsable_email}
                            onChange={(e) =>
                                setData(
                                    "responsable_email",
                                    formatEmail(e.target.value),
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Profession
                        </label>

                        <input
                            type="text"
                            value={data.responsable_profession}
                            onChange={(e) =>
                                setData(
                                    "responsable_profession",
                                    formatTexte(e.target.value),
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block font-semibold mb-2">
                            Adresse
                        </label>

                        <textarea
                            value={data.responsable_adresse}
                            onChange={(e) =>
                                setData("responsable_adresse", e.target.value)
                            }
                            rows="3"
                            className="w-full rounded-lg border p-3"
                        />
                    </div>
                </div>
            </div>

            {/* =========================================================
                INFORMATIONS MÉDICALES
            ========================================================= */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        🏥 Informations médicales
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    {/* Groupe sanguin */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Groupe sanguin
                        </label>

                        <select
                            value={data.groupe_sanguin}
                            onChange={(e) =>
                                setData("groupe_sanguin", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Sélectionner...</option>

                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>

                        {errors.groupe_sanguin && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.groupe_sanguin}
                            </p>
                        )}
                    </div>

                    {/* Contact urgence */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Contact d'urgence
                        </label>

                        <input
                            type="text"
                            value={data.contact_urgence_nom}
                            onChange={(e) =>
                                setData("contact_urgence_nom", e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    {/* Téléphone urgence */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Téléphone d'urgence
                        </label>

                        <input
                            type="text"
                            value={data.contact_urgence_telephone}
                            onChange={(e) =>
                                setData(
                                    "contact_urgence_telephone",
                                    e.target.value,
                                )
                            }
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    {/* Allergies */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Allergies
                        </label>

                        <textarea
                            value={data.allergies}
                            onChange={(e) =>
                                setData("allergies", e.target.value)
                            }
                            rows="2"
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    {/* Observations médicales */}
                    <div className="col-span-2">
                        <label className="block font-semibold mb-2">
                            Observations médicales
                        </label>

                        <textarea
                            value={data.observations_medicales}
                            onChange={(e) =>
                                setData(
                                    "observations_medicales",
                                    e.target.value,
                                )
                            }
                            rows="3"
                            className="w-full rounded-lg border p-3"
                        />
                    </div>
                </div>
            </div>

            {/* =========================================================
                STATUT SYSTÈME
            ========================================================= */}

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold">⚙️ Statut système</h2>
                </div>

                <div className="p-6">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={data.actif}
                            onChange={(e) => setData("actif", e.target.checked)}
                        />

                        <span className="font-semibold">Élève actif</span>
                    </label>
                </div>
            </div>

            {/* =========================================================
                BOUTONS
            ========================================================= */}

            <div className="flex justify-end gap-4">
                <Link
                    href={route("eleves.index")}
                    className="rounded-lg border px-6 py-3 hover:bg-gray-50"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {processing ? "Enregistrement..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
