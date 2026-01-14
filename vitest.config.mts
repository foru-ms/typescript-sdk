import { defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    globals: true,
                    name: "unit",
                    environment: "node",
                    root: "./tests",
                    include: ["**/*.test.{js,ts,jsx,tsx}"],
                    exclude: ["wire/**"],
                    setupFiles: ["./setup.ts"],
                },
            },
        ],
        passWithNoTests: true,
    },
});
