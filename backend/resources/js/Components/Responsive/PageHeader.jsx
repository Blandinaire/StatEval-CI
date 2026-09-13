import { Link } from "@inertiajs/react";

export default function PageHeader({
    title,
    description,
    actionLabel,
    actionHref,
    children,
}) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* TITRES */}

            <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                    {title}
                </h1>

                {description && (
                    <p className="mt-1 text-sm text-gray-500 sm:text-base">
                        {description}
                    </p>
                )}
            </div>

            {/* ACTIONS */}

            {(actionLabel || children) && (
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    {children}

                    {actionLabel && actionHref && (
                        <Link
                            href={actionHref}
                            className="w-full rounded-lg bg-blue-600 px-5 py-3 text-center text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                        >
                            {actionLabel}
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
