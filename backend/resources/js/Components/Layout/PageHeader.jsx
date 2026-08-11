export default function PageHeader({
    title,
    subtitle,
    children,
}) {
    return (
        <div className="flex items-center justify-between mb-6">

            <div>

                <h1 className="text-3xl font-bold text-gray-800">
                    {title}
                </h1>

                {subtitle && (
                    <p className="mt-1 text-sm text-gray-500">
                        {subtitle}
                    </p>
                )}

            </div>

            {children}

        </div>
    );
}