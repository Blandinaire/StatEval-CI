import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const { auth = {} } = usePage().props;
    const user = auth?.user;

    const role =
        user?.role ??
        user?.roles?.[0]?.name ??
        'Utilisateur';

    const etablissement =
        user?.etablissement?.nom ??
        'Non affecté';

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user?.name ?? '',
            email: user?.email ?? '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>

            {/* =====================================================
                INFORMATIONS PERSONNELLES
            ===================================================== */}

            <header>
                <h2 className="text-lg font-semibold text-gray-900">
                    Informations personnelles
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Consultez et modifiez vos informations personnelles.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">

                {/* Nom */}

                <div>
                    <InputLabel
                        htmlFor="name"
                        value="Nom complet"
                    />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) =>
                            setData('name', e.target.value)
                        }
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError
                        className="mt-2"
                        message={errors.name}
                    />
                </div>

                {/* Email */}

                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Adresse e-mail"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) =>
                            setData('email', e.target.value)
                        }
                        required
                        autoComplete="username"
                    />

                    <InputError
                        className="mt-2"
                        message={errors.email}
                    />
                </div>

                {/* =================================================
                    INFORMATIONS PROFESSIONNELLES
                ================================================= */}

                <div className="border-t border-gray-200 pt-6">

                    <h3 className="text-base font-semibold text-gray-900">
                        Informations professionnelles
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Ces informations sont gérées par l'administration.
                    </p>

                    <div className="mt-6 space-y-6">

                        {/* Fonction */}

                        <div>
                            <InputLabel
                                htmlFor="fonction"
                                value="Fonction"
                            />

                            <TextInput
                                id="fonction"
                                className="mt-1 block w-full bg-gray-100 text-gray-700"
                                value={user?.fonction ?? 'Non renseignée'}
                                disabled
                            />
                        </div>

                        {/* Rôle */}

                        <div>
                            <InputLabel
                                htmlFor="role"
                                value="Rôle"
                            />

                            <TextInput
                                id="role"
                                className="mt-1 block w-full bg-gray-100 text-gray-700"
                                value={role}
                                disabled
                            />
                        </div>

                        {/* Établissement */}

                        <div>
                            <InputLabel
                                htmlFor="etablissement"
                                value="Établissement"
                            />

                            <TextInput
                                id="etablissement"
                                className="mt-1 block w-full bg-gray-100 text-gray-700"
                                value={etablissement}
                                disabled
                            />
                        </div>

                        {/* Statut */}

                        <div>
                            <InputLabel
                                htmlFor="statut"
                                value="Statut du compte"
                            />

                            <div className="mt-1 flex h-10 items-center">
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                        user?.actif
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    <span className="mr-2 h-2 w-2 rounded-full bg-current" />

                                    {user?.actif
                                        ? 'Compte actif'
                                        : 'Compte inactif'}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* =================================================
                    ENREGISTREMENT
                ================================================= */}

                <div className="flex items-center gap-4">

                    <PrimaryButton disabled={processing}>
                        Enregistrer
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600">
                            Modifications enregistrées.
                        </p>
                    </Transition>

                </div>

                {/* =================================================
                    VÉRIFICATION E-MAIL
                ================================================= */}

                {mustVerifyEmail &&
                    user?.email_verified_at === null && (
                        <div className="border-t border-gray-200 pt-6">

                            <p className="text-sm text-gray-800">
                                Votre adresse e-mail n'est pas encore
                                vérifiée.
                            </p>

                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="mt-2 text-sm text-indigo-600 underline hover:text-indigo-800"
                            >
                                Renvoyer l'e-mail de vérification
                            </Link>

                            {status === 'verification-link-sent' && (
                                <p className="mt-2 text-sm font-medium text-green-600">
                                    Un nouvel e-mail de vérification a été envoyé.
                                </p>
                            )}

                        </div>
                    )}

            </form>
        </section>
    );
}