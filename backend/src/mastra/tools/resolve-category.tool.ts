
/**
 * Tool to resolve or create a category by name and type.
 */
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createCategoryEntryRepo } from "../../db/repo";

export const resolveCategoryTool = createTool({
    id: "resolve-category",

    description:
        "Find a similar category. If none exists, create a new category. Does not write entries.",

    inputSchema: z.object({
        name: z.string().min(1).describe("Short reusable category name"),
        type: z.enum(["numeric", "bool", "str"]),

        numericMin: z.number().nullable().optional(),
        numericMax: z.number().nullable().optional(),
    }),

    outputSchema: z.object({
        categoryId: z.number(),
        name: z.string(),
        type: z.enum(["numeric", "bool", "str"]),
        numericMin: z.number().nullable().optional(),
        numericMax: z.number().nullable().optional(),
        created: z.boolean(),
    }),

    execute: async (inputData) => {
        const repo = await createCategoryEntryRepo();

        const result = await repo.resolveCategory({
            name: inputData.name,
            type: inputData.type,
            numericMin: inputData.numericMin ?? null,
            numericMax: inputData.numericMax ?? null,
        });

        return {
            categoryId: result.category.id,
            name: result.category.name,
            type: result.category.type,
            numericMin: result.category.numericMin,
            numericMax: result.category.numericMax,
            created: result.created,
        };
    },
});