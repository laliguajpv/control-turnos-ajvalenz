import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
    const privateKey = rawKey.replace(/\\n/g, '\n').replace(/"/g, '').trim();

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim(),
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID?.trim(), serviceAccountAuth);
    await doc.loadInfo(); 
    
    // 1. Buscamos la hoja CONFIGURACION
    const sheet = doc.sheetsByTitle['CONFIGURACION'] || doc.sheetsByIndex[1];
    
    // 2. Cargamos un cuadro de celdas (de la fila 2 a la 100, columnas A a la G)
    await sheet.loadCells('A2:G100');

    const guardias = [];
    const instalaciones = [];
    const supervisores = [];
    const motivos = [];
    const turnos = [];

    // 3. Recorremos las celdas una por una (Fuerza Bruta)
    for (let i = 1; i < 100; i++) {
      const id = sheet.getCell(i, 0).value; // Columna A
      const nombre = sheet.getCell(i, 1).value; // Columna B
      const inst = sheet.getCell(i, 3).value; // Columna D
      const sup = sheet.getCell(i, 4).value; // Columna E
      const mot = sheet.getCell(i, 5).value; // Columna F
      const tur = sheet.getCell(i, 6).value; // Columna G

      if (nombre) guardias.push({ id: String(id || ''), nombre: String(nombre) });
      if (inst) instalaciones.push(String(inst));
      if (sup) supervisores.push(String(sup));
      if (mot) motivos.push(String(mot));
      if (tur) turnos.push(String(tur));
    }

    return NextResponse.json({ guardias, instalaciones, supervisores, motivos, turnos });

  } catch (error) {
    return NextResponse.json({ error: "Error de lectura", detalle: error.message }, { status: 500 });
  }
}