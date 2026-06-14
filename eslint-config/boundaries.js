/**
 * ESLint boundary enforcement rules
 * Prevents architectural violations in monorepo
 */

/** @type {import("eslint").Linter.Config[]} */
export const boundariesConfig = [
  {
    rules: {
      // Prevent cross-app imports
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../apps/*"],
              message: "Apps cannot import from other apps. Use shared packages instead.",
            },
            {
              group: ["@relique/shared/src/*", "@relique/ui/src/*"],
              message: "Do not import from internal package paths. Use public exports only.",
            },
            {
              group: ["*/impl/*.local.ts"],
              message: "UI layer cannot import service implementations directly. Use service registry/context instead.",
            },
          ],
        },
      ],
      
      // Prevent localStorage direct access in UI layer
      "no-restricted-globals": [
        "error",
        {
          name: "localStorage",
          message: "Do not access localStorage directly. Use service layer or shared storage helpers.",
        },
      ],
      
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='window'][property.name='localStorage']",
          message: "Do not access window.localStorage directly. Use service layer or shared storage helpers.",
        },
        {
          selector: "CallExpression[callee.object.name='localStorage']",
          message: "Do not call localStorage methods directly. Use service layer or shared storage helpers.",
        },
      ],
    },
  },
];

