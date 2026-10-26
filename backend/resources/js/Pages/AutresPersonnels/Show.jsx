import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

function afficherValeur(valeur) {
    if (valeur === null || valeur === undefined || valeur === "") {
        return "Non renseigné";
    }

    return valeur;
}

function afficherDate(valeur) {
    if (!valeur) return "Non renseignée";

    const date = new Date(String(valeur).slice(0, 10) + "T00:00:00");
    if (Number.isNaN(date.getTime())) return "Non renseignée";

    return date.toLocaleDateString("fr-FR");
}

function LigneInfo({ label, valeur }) {
    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 break-words text-gray-900">
                {afficherValeur(valeur)}
            </dd>
        </div>
    );
}

function Section({ titre, enfants }) {
    return (
        <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 border-b pb-2 text-lg font-semibold text-gray-800">
                {titre}
            </h2>
            <dl>{enfants}</dl>
        </section>
    );
}

export default function Show({ personnel }) {
    const nomComplet = [personnel.prenoms, personnel.nom]
        .filter(Boolean)
        .join(" ");

    return (
        <AdminLayout>
            <Head title={`Fiche de ${nomComplet || "personnel"}`} />

            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Fiche du personnel
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Informations administratives et professionnelles.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={route("autres-personnels.index")}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Retour à la liste
                        </Link>
                        <Link
                            href={route("autres-personnels.edit", personnel.id)}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Modifier
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                            {String(personnel.prenoms || personnel.nom || "?")
                                .trim()
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {nomComplet || "Nom non renseigné"}
                            </h2>
                            <p className="mt-1 text-gray-600">
                                {personnel.fonction?.libelle || "Fonction non renseignée"}
                                {personnel.matricule ? ` · ${personnel.matricule}` : ""}
                            </p>
                        </div>
                        <span
                            className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${
                                personnel.statut === "Actif" && personnel.actif
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            {personnel.statut || (personnel.actif ? "Actif" : "Inactif")}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <Section
                        titre="Identité"
                        enfants={
                            <>
                                <LigneInfo label="Matricule" valeur={personnel.matricule} />
                                <LigneInfo label="Nom" valeur={personnel.nom} />
                                <LigneInfo label="Prénoms" valeur={personnel.prenoms} />
                                <LigneInfo label="Sexe" valeur={personnel.sexe} />
                                <LigneInfo label="Date de naissance" valeur={afficherDate(personnel.date_naissance)} />
                                <LigneInfo label="Lieu de naissance" valeur={personnel.lieu_naissance} />
                                <LigneInfo label="Nationalité" valeur={personnel.nationalite} />
                            </>
                        }
                    />

                    <Section
                        titre="Informations professionnelles"
                        enfants={
                            <>
                                <LigneInfo label="Fonction" valeur={personnel.fonction?.libelle} />
                                <LigneInfo label="Type de personnel" valeur={personnel.type} />
                                <LigneInfo label="Grade ou qualification" valeur={personnel.grade} />
                                <LigneInfo label="Date d'embauche" valeur={afficherDate(personnel.date_embauche)} />
                                <LigneInfo label="Date de prise de service" valeur={afficherDate(personnel.date_prise_service)} />
                                <LigneInfo label="Statut administratif" valeur={personnel.statut} />
                                <LigneInfo label="Dossier actif" valeur={personnel.actif ? "Oui" : "Non"} />
                                <LigneInfo label="Établissement" valeur={personnel.etablissement?.nom} />
                            </>
                        }
                    />

                    <Section
                        titre="Coordonnées"
                        enfants={
                            <>
                                <LigneInfo label="Téléphone" valeur={personnel.telephone} />
                                <LigneInfo label="Adresse e-mail" valeur={personnel.email} />
                                <LigneInfo label="Adresse" valeur={personnel.adresse} />
                            </>
                        }
                    />

                    <Section
                        titre="Compte utilisateur associé"
                        enfants={
                            <>
                                <LigneInfo label="Nom du compte" valeur={personnel.user?.name} />
                                <LigneInfo label="E-mail du compte" valeur={personnel.user?.email} />
                            </>
                        }
                    />
                </div>

                <section className="rounded-xl bg-white p-5 shadow-sm">
                    <h2 className="mb-3 border-b pb-2 text-lg font-semibold text-gray-800">
                        Observations
                    </h2>
                    <p className="whitespace-pre-wrap text-gray-700">
                        {afficherValeur(personnel.observations)}
                    </p>
                </section>
            </div>
        </AdminLayout>
    );
}
