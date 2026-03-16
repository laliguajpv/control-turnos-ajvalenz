import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Limpieza de la llave (Esto arregla el error 'undefined' de Vercel)
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
    const privateKey = rawKey.replace(/\\n/g, '\n').replace(/"/g, '').trim();

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); 
    
    // 2. Buscamos la hoja (Por nombre o por posición para que no falle)
    const sheet = doc.sheetsByTitle['CONFIGURACION'] || doc.sheetsByIndex[1];
    const rows = await sheet.getRows();

    // 3. Devolvemos los datos (NADA DE RUT, solo lo que pediste)
    return NextResponse.json({
      guardias: rows.map(r => ({ 
        id: r._rawData[0] || '',      // Columna A
        nombre: r._rawData[1] || ''   // Columna B
      })).filter(g => g.nombre),
      instalaciones: rows.map(r => r._rawData[3]).filter(Boolean), // Columna D
      supervisores: rows.map(r => r._rawData[4]).filter(Boolean),  // Columna E
      motivos: rows.map(r => r._rawData[5]).filter(Boolean),       // Columna F
      turnos: rows.map(r => r._rawData[6]).filter(Boolean),        // Columna G
    });

  } catch (error) {
    // Esto nos dirá si es la llave o el permiso
    return NextResponse.json({ 
      error: "Error en la conexión", 
      mensaje: error.message || "La llave no es válida" 
    }, { status: 500 });
  }
}