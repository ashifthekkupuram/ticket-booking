export const uniqueViolation = (error: unknown): string | undefined => {
  const e = error as {
    code?: string;
    constraint?: string;
    cause?: { code?: string; constraint?: string };
  };
  const pg = e?.cause?.code ? e.cause : e;
  return pg?.code === '23505' ? pg.constraint : undefined;
};
