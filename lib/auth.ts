import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    advanced: {
        database: {
            generateId: "uuid",
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "customer",
                input: true,
                required: false,
            },
            phoneNumber: {
                type: "string",
                input: true,
                required: false,
            },
            address: {
                type: "string",
                input: true,
                required: false,
            }
        }
    }
});
