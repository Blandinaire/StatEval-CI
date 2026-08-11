export default function SelectField({
    label,
    error,
    children,
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

            <select
                {...props}
                className={
                    "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 " +
                    className
                }
            >
                {children}
            </select>

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

        </div>
    );
}