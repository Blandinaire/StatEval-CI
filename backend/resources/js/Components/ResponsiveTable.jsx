export default function ResponsiveTable({
    children,
    minWidth = "700px",
}) {
    return (
        <div className="w-full overflow-x-auto">
            <table
                className="w-full"
                style={{ minWidth }}
            >
                {children}
            </table>
        </div>
    );
}