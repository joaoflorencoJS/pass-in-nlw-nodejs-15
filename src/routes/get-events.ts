import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function getEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/:eventId",
    {
      schema: {
        params: z.object({
          eventId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            title: z.string(),
            slug: z.string(),
            details: z.string().nullable(),
            maximumAttendees: z.number().int().nullable(),
            attendeesAmout: z.number().int(),
          }),
        },
      },
    },
    async (req, res) => {
      const { eventId } = req.params;

      const eventWithCount = await prisma.event.findUnique({
        select: {
          id: true,
          title: true,
          slug: true,
          details: true,
          maximumAttendees: true,
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        where: { id: eventId },
      });

      if (eventWithCount === null) throw new Error("Event not found.");

      const {
        _count: { attendees: attendeesAmout },
        ...event
      } = eventWithCount;

      return res.send({ ...event, attendeesAmout });
    }
  );
}
