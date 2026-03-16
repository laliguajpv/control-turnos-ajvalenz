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
    
    // CONCLUSIÓN: Forzamos que busque la hoja por nombre exacto o por la posición 2 (índice 1)
    const sheet = doc.sheetsByTitle['CONFIGURACION'] || doc.sheetsByIndex[1];
    const rows = await sheet.getRows();

    // Leemos las columnas según tu Captura 150
    return NextResponse.json({
      guardias: rows.map(r => ({ 
        id: r._rawData[0] || '',      // Columna A (ID)
        nombre: r._rawData[1] || ''   // Columna B (Guardias)
      })).filter(g => g.nombre),
      
      // Saltamos el RUT (Columna C) y seguimos con las demás:
      instalaciones: rows.map(r => r._rawData[3]).filter(Boolean), // Columna D
      supervisores: rows.map(r => r._rawData[4]).filter(Boolean),  // Columna E
      motivos: rows.map(r => r._rawData[5]).filter(Boolean),       // Columna F
      turnos: rows.map(r => r._rawData[6]).filter(Boolean),        // Columna G
    });

  } catch (error) {
    return NextResponse.json({ error: "Fallo de lectura", detalle: error.message }, { status: 500 });
  }
}