import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Mon profil
                    </h2>
                    <p className="text-sm text-gray-500">
                        Consultez et modifiez les informations de votre compte.
                    </p>
                </div>
            }
        >
            <Head title="Mon profil" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">

                    {/* Informations du profil */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-2xl"
                        />
                    </div>

                    {/* Mot de passe */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-2xl" />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}