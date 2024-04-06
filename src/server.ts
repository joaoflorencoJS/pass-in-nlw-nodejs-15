import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import { date, z } from "zod";

const app = fastify();

const prisma = new PrismaClient({
  log: ["query"],
});

app.post("/events", async (req, res) => {
  const createEventSchema = z.object({
    title: z.string().min(4),
    details: z.string().nullable(),
    maximumAttendees: z.number(),
  });

  const { title, details, maximumAttendees } = createEventSchema.parse(req.body);

  const event = await prisma.event.create({
    data: {
      title,
      details,
      maximumAttendees,
      slug: new Date().toISOString(),
    },
  });

  return res.status(201).send({ eventId: event.id });
});

app.listen({ port: 3333 }, () => {
  console.log(`Listening in http://localhost:3333`);
});
