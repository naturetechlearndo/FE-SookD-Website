const cache = new Map<string, { data: any; exp: number }>();
// const TTL = 5 * 60 * 1000;
const TTL = 0;

export function clearSheetCache(sheetName: string) {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) return;
    cache.delete(`${spreadsheetId}:${sheetName}`);
}

export function patchSheetCache(sheetName: string, idField: string, idValue: string, updates: any) {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) return;
    const key = `${spreadsheetId}:${sheetName}`;
    const cached = cache.get(key);
    if (!cached) return;
    const patched = (cached.data as any[]).map((item: any) =>
        String(item[idField]) === String(idValue) ? { ...item, ...updates } : item
    );
    cache.set(key, { data: patched, exp: cached.exp });
}

export async function getSheetData(sheetName: string) {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) throw new Error("SPREADSHEET_ID not found");

    const key = `${spreadsheetId}:${sheetName}`;
    const cached = cache.get(key);
    if (cached && Date.now() < cached.exp) return cached.data;

    const url = `https://opensheet.elk.sh/${spreadsheetId}/${sheetName}?raw=true`;
    const response = await fetch(url);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error(`getSheetData: invalid response for sheet "${sheetName}"`);
    cache.set(key, { data, exp: Date.now() + TTL });
    return data;
}
