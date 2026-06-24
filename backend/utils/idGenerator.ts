// utils/idGenerator.ts

export function generateNextId(
    ids: string[],
    prefix: string
): string {

    const maxId = Math.max(
        ...ids.map(id =>
            Number(
                id.replace(prefix, "")
            )
        ),
        0
    );

    return `${prefix}${String(maxId + 1).padStart(3, "0")}`;
}