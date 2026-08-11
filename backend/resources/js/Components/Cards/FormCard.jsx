export default function FormCard({
    children,
    className = "",
}) {
    return (
        <div
            className={
                "max-w-5xl rounded-xl border border-gray-200 bg-white shadow-sm p-6 " +
                className
            }
        >
            {children}
        </div>
    );
}