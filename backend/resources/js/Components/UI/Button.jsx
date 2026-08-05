export default function Button({
    children,
    type = "button",
    variant = "primary",
    className = "",
    ...props
}) {

    const styles = {
        primary:
            "bg-blue-600 hover:bg-blue-700 text-white",

        success:
            "bg-green-600 hover:bg-green-700 text-white",

        danger:
            "bg-red-600 hover:bg-red-700 text-white",

        secondary:
            "bg-gray-600 hover:bg-gray-700 text-white",

        warning:
            "bg-yellow-500 hover:bg-yellow-600 text-white",

        outline:
            "border border-gray-300 bg-white hover:bg-gray-100 text-gray-700",
    };

    return (
        <button
            type={type}
            className={`
                px-4
                py-2
                rounded-lg
                transition
                duration-200
                font-medium
                ${styles[variant]}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
}