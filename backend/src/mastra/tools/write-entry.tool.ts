
/**
 * Tool to write a validated entry for an existing category.
 */
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createCategoryEntryRepo } from "../../db/repo";

export const writeEntryTool = createTool({
    id: "write-entry",

    description:
        "Write one entry for an existing category. The value is validated against the category type.",

    inputSchema: z.object({
        categoryId: z.number().int().positive(),

        value: z.union([z.string(), z.number(), z.boolean()]),

        sourceText: z.string().optional(),
    }),

    outputSchema: z.object({
        entryId: z.number(),

        category: z.object({
            id: z.number(),
            name: z.string(),
            type: z.enum(["numeric", "bool", "str"]),
        }),

        storedValue: z.object({
            type: z.enum(["numeric", "bool", "str"]),
            value: z.union([z.string(), z.number(), z.boolean()]),
        }),
    }),

    execute: async (inputData) => {
        const repo = await createCategoryEntryRepo();

        const result = await repo.writeEntry({
            categoryId: inputData.categoryId,
            value: inputData.value,
            sourceText: inputData.sourceText,
        });

        return {
            entryId: result.entry.id,

            category: {
                id: result.category.id,
                name: result.category.name,
                type: result.category.type,
            },

            storedValue: result.typedValue,
        };
    },
});