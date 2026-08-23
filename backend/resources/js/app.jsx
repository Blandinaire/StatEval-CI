import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: async (name) => {
        const pages = import.meta.glob("./Pages/**/*.jsx");

        const page = pages[`./Pages/${name}.jsx`];

        if (!page) {
            throw new Error(
                `Page Inertia introuvable : ./Pages/${name}.jsx`,
            );
        }

        const module = await page();

        return module.default ?? module;
    },

    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },

    progress: {
        color: "#4B5563",
    },
});