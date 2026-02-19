import { FastifyReply, FastifyRequest } from "fastify";

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    if ((request.user as { role?: string }).role !== "ADMIN") {
      return reply.code(403).send({ message: "Forbidden" });
    }
  } catch {
    return reply.code(401).send({ message: "Unauthorized" });
  }
}
