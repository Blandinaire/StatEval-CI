import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

import {
    ArrowLeft,
    Building2,
    MapPin,
    Phone,
    Mail,
    Pencil,
    UserRound,
} from "lucide-react";

export default function Show({ etablissement }) {
    return (
        <AdminLayout>
            <Head title={etablissement.nom} />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route("etablissements.index")}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                        >
                            <ArrowLeft size={20} />
                        </Link>

                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">
                                Fiche établissement
                            </h1>

                            <p className="mt-1 text-gray-500">
                                Informations institutionnelles et
                                administratives.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route("etablissements.edit", etablissement.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        <Pencil size={18} />
                        Modifier
                    </Link>
                </div>

                {/* =====================================================
                    IDENTITÉ PRINCIPALE
                ===================================================== */}

                <div className="overflow-hidden rounded-2xl bg-white shadow">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-10 text-white">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center">
                            {/* Logo */}

                            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow">
                                {etablissement.logo ? (
                                    <img
                                        src={`/storage/${etablissement.logo}`}
                                        alt={etablissement.nom}
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <Building2
                                        size={54}
                                        className="text-blue-600"
                                    />
                                )}
                            </div>

                            {/* Nom */}

                            <div>
                                <h2 className="text-3xl font-bold">
                                    {etablissement.nom}
                                </h2>

                                {etablissement.sigle && (
                                    <p className="mt-1 text-xl text-blue-100">
                                        {etablissement.sigle}
                                    </p>
                                )}

                                <div className="mt-5 flex flex-wrap gap-3">
                                    {etablissement.code && (
                                        <Badge>
                                            Code : {etablissement.code}
                                        </Badge>
                                    )}

                                    {etablissement.type && (
                                        <Badge>{etablissement.type}</Badge>
                                    )}

                                    <Badge>
                                        {etablissement.actif
                                            ? "✓ Établissement actif"
                                            : "Établissement inactif"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        INFORMATIONS
                    ================================================= */}

                    <div className="grid gap-8 p-8 lg:grid-cols-2">
                        {/* Informations générales */}

                        <InfoCard
                            icon={Building2}
                            title="Informations générales"
                        >
                            <Info
                                label="Nom complet"
                                value={etablissement.nom}
                            />

                            <Info label="Sigle" value={etablissement.sigle} />

                            <Info label="Devise" value={etablissement.devise} />

                            <Info label="Slogan" value={etablissement.slogan} />
                        </InfoCard>

                        {/* Localisation */}

                        <InfoCard icon={MapPin} title="Localisation">
                            <Info
                                label="Commune"
                                value={etablissement.commune}
                            />

                            <Info label="Ville" value={etablissement.ville} />

                            <Info
                                label="Quartier"
                                value={etablissement.quartier}
                            />

                            <Info label="Région" value={etablissement.region} />

                            <Info
                                label="Adresse"
                                value={etablissement.adresse}
                            />
                        </InfoCard>

                        {/* Contacts */}

                        <InfoCard icon={Phone} title="Contacts">
                            <Info
                                label="Téléphone"
                                value={etablissement.telephone}
                            />

                            <Info
                                label="Téléphone secondaire"
                                value={etablissement.telephone_secondaire}
                            />

                            <Info
                                label="WhatsApp"
                                value={etablissement.whatsapp}
                            />

                            <Info label="E-mail" value={etablissement.email} />

                            <Info
                                label="Site web"
                                value={etablissement.site_web}
                            />
                        </InfoCard>

                        {/* Administration */}

                        <InfoCard icon={Mail} title="Administration éducative">
                            <Info
                                label="Direction régionale"
                                value={etablissement.direction_regionale}
                            />

                            <Info
                                label="Inspection"
                                value={etablissement.inspection}
                            />

                            <Info
                                label="Académie"
                                value={etablissement.academie}
                            />
                        </InfoCard>
                    </div>
                </div>

                {/* =====================================================
    RESPONSABLES
===================================================== */}

                <div className="rounded-2xl bg-white p-8 shadow">
                    {/* =================================================
        EN-TÊTE RESPONSABLES
    ================================================= */}

                    <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                                <UserRound size={24} />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">
                                    Responsables de l'établissement
                                </h2>

                                <p className="mt-1 text-gray-500">
                                    Fondateur, direction et responsables
                                    administratifs.
                                </p>
                            </div>
                        </div>

                        {/* ACTIONS RESPONSABLES */}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={route(
                                    "etablissements.responsables.index",
                                    etablissement.id,
                                )}
                                className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                            >
                                Gérer les responsables
                            </Link>

                            <Link
                                href={route(
                                    "etablissements.responsables.create",
                                    etablissement.id,
                                )}
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                + Ajouter un responsable
                            </Link>
                        </div>
                    </div>

                    {/* =================================================
        LISTE RESPONSABLES
    ================================================= */}

                    {!etablissement.responsables ||
                    etablissement.responsables.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-gray-500">
                            <p>Aucun responsable enregistré.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {etablissement.responsables.map((responsable) => (
                                <div
                                    key={responsable.id}
                                    className="rounded-xl border border-slate-200 p-6 transition hover:shadow-md"
                                >
                                    {/* EN-TÊTE CARTE */}

                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">
                                                {responsable.civilite}{" "}
                                                {responsable.nom}{" "}
                                                {responsable.prenoms}
                                            </h3>

                                            <p className="mt-1 font-medium text-blue-600">
                                                {responsable.fonction}
                                            </p>
                                        </div>

                                        {responsable.principal && (
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                Principal
                                            </span>
                                        )}
                                    </div>

                                    {/* CONTACTS */}

                                    <div className="mt-6 space-y-3 text-sm text-slate-600">
                                        {responsable.telephone && (
                                            <div>
                                                <span className="font-semibold">
                                                    Téléphone :
                                                </span>{" "}
                                                {responsable.telephone}
                                            </div>
                                        )}

                                        {responsable.whatsapp && (
                                            <div>
                                                <span className="font-semibold">
                                                    WhatsApp :
                                                </span>{" "}
                                                {responsable.whatsapp}
                                            </div>
                                        )}

                                        {responsable.email && (
                                            <div className="break-all">
                                                <span className="font-semibold">
                                                    E-mail :
                                                </span>{" "}
                                                {responsable.email}
                                            </div>
                                        )}
                                    </div>

                                    {/* ACTION MODIFIER */}

                                    <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                                        <Link
                                            href={route(
                                                "etablissements.responsables.edit",
                                                [
                                                    etablissement.id,
                                                    responsable.id,
                                                ],
                                            )}
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                                        >
                                            <Pencil size={16} />
                                            Modifier
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

/*
|--------------------------------------------------------------------------
| COMPOSANTS
|--------------------------------------------------------------------------
*/

function Badge({ children }) {
    return (
        <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
            {children}
        </span>
    );
}

function InfoCard({ icon: Icon, title, children }) {
    return (
        <section className="rounded-xl border border-slate-200 p-6">
            <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-slate-800">
                <Icon size={22} className="text-blue-600" />

                {title}
            </h3>

            <div className="space-y-4">{children}</div>
        </section>
    );
}

function Info({ label, value }) {
    return (
        <div className="border-b border-slate-100 pb-3 last:border-b-0">
            <p className="text-sm text-slate-500">{label}</p>

            <p className="mt-1 font-medium text-slate-800">
                {value || "Non renseigné"}
            </p>
        </div>
    );
}
