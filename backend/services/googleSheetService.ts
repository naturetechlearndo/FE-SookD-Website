export async function getSheetData(sheetName: string) {
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!spreadsheetId) {
        throw new Error("SPREADSHEET_ID not found");
    }

    const url =
        `https://opensheet.elk.sh/${spreadsheetId}/${sheetName}`;

    const response = await fetch(url);

    return await response.json();
}