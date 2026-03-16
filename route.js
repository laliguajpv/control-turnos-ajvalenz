import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY 
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '').trim() 
      : undefined;

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); 
    
    const sheet = doc.sheetsByTitle['CONFIGURACION'];
    const rows = await sheet.getRows();

    // LEEMOS POR POSICIÓN (A, B, C...) PARA EVITAR ERRORES DE NOMBRES
    return NextResponse.json({
      guardias: rows.map(r => ({ 
        id: r._rawData[0] || '',      // Columna A (ID)
        nombre: r._rawData[1] || ''   // Columna B (Guardias)
      })).filter(g => g.nombre),
      
      instalaciones: rows.map(r => r._rawData[3]).filter(Boolean), // Columna D
      supervisores: rows.map(r => r._rawData[4]).filter(Boolean),  // Columna E
      motivos: rows.map(r => r._rawData[5]).filter(Boolean),       // Columna F
      turnos: rows.map(r => r._rawData[6]).filter(Boolean),        // Columna G
    });
  } catch (error) {
    return NextResponse.json({ error: "Fallo de conexión", detalle: error.message }, { status: 500 });
  }
}