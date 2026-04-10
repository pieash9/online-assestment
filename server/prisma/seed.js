"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma_adapter_1 = require("../src/lib/prisma-adapter");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run the seed script");
}
const prisma = new client_1.PrismaClient({
    adapter: (0, prisma_adapter_1.createMySqlAdapter)(databaseUrl)
});
async function ensureDatabaseSchemaReady() {
    try {
        await prisma.user.count();
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2021") {
            throw new Error("Database tables do not exist yet. Run `yarn prisma:migrate` first, then run `yarn prisma:seed`.");
        }
        throw error;
    }
}
async function main() {
    await ensureDatabaseSchemaReady();
    await prisma.answerOption.deleteMany();
    await prisma.answer.deleteMany();
    await prisma.examAttempt.deleteMany();
    await prisma.examAssignment.deleteMany();
    await prisma.questionOption.deleteMany();
    await prisma.question.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.user.deleteMany();
    const password = await bcryptjs_1.default.hash("Password123!", 10);
    const employer = await prisma.user.create({
        data: {
            name: "Employer Admin",
            email: "employer@example.com",
            password,
            role: client_1.UserRole.EMPLOYER
        }
    });
    const candidateOne = await prisma.user.create({
        data: {
            name: "Candidate One",
            email: "candidate1@example.com",
            password,
            role: client_1.UserRole.CANDIDATE
        }
    });
    const candidateTwo = await prisma.user.create({
        data: {
            name: "Candidate Two",
            email: "candidate2@example.com",
            password,
            role: client_1.UserRole.CANDIDATE
        }
    });
    const exam = await prisma.exam.create({
        data: {
            title: "Frontend Engineer Assessment",
            totalCandidates: 2,
            totalSlots: 3,
            questionSets: 1,
            questionType: "Mixed",
            negativeMarking: 0.25,
            startTime: new Date(Date.now() - 60 * 60 * 1000),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            durationMinutes: 45,
            createdById: employer.id,
            questions: {
                create: [
                    {
                        title: "Which tools are commonly used for React state management?",
                        type: client_1.QuestionType.CHECKBOX,
                        options: {
                            create: [
                                { label: "Redux", isCorrect: true },
                                { label: "Zustand", isCorrect: true },
                                { label: "MySQL", isCorrect: false },
                                { label: "Prisma", isCorrect: false }
                            ]
                        }
                    },
                    {
                        title: "Which hook is used to manage component state in React?",
                        type: client_1.QuestionType.RADIO,
                        options: {
                            create: [
                                { label: "useMemo", isCorrect: false },
                                { label: "useState", isCorrect: true },
                                { label: "useEffect", isCorrect: false }
                            ]
                        }
                    },
                    {
                        title: "Briefly explain what responsive design means.",
                        type: client_1.QuestionType.TEXT
                    }
                ]
            }
        }
    });
    await prisma.examAssignment.createMany({
        data: [
            { examId: exam.id, candidateId: candidateOne.id },
            { examId: exam.id, candidateId: candidateTwo.id }
        ]
    });
    console.log("Seed complete");
    console.log({
        employer: { email: "employer@example.com", password: "Password123!" },
        candidateOne: { email: "candidate1@example.com", password: "Password123!" },
        candidateTwo: { email: "candidate2@example.com", password: "Password123!" }
    });
}
main()
    .catch((error) => {
    if (error instanceof Error) {
        console.error(error.message);
    }
    else {
        console.error(error);
    }
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
