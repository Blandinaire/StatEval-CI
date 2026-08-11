export default function TextField({
    label,
    error,
    className = "",
    ...props
}) {
    return (
        <div className="space-y-1">

            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <input
                {...props}
                className={
                    "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 " +
                    className
                }
            />

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

        </div>
    );
}