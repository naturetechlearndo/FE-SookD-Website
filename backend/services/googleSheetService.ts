const cache = new Map<string, { data: any; exp: number }>();
const TTL = 5 * 60 * 1000;

export async function getSheetData(sheetName: string) {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) throw new Error("SPREADSHEET_ID not found");

    const key = `${spreadsheetId}:${sheetName}`;
    const cached = cache.get(key);
    if (cached && Date.now() < cached.exp) return cached.data;

    const url = `https://opensheet.elk.sh/${spreadsheetId}/${sheetName}?raw=true`;
    const response = await fetch(url);
    const data = await response.json();
    cache.set(key, { data, exp: Date.now() + TTL });
    return data;
}
