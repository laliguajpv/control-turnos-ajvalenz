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
    
    // BUSCA-HUELLAS: Buscamos la hoja por nombre exacto, ignorando mayúsculas o espacios locos
    const sheet = doc.sheetsByIndex.find(s => 
      s.title.toUpperCase().trim() === 'CONFIGURACION'
    ) || doc.sheetsByIndex[1]; // Si no la encuentra por nombre, usa la segunda pestaña

    const rows = await sheet.getRows();

    // Si llegamos aquí y no hay filas, devolvemos un error claro para saber qué pasa
    if (rows.length === 0) {
      return NextResponse.json({ 
        error: "Hoja encontrada pero sin datos", 
        hoja_leida: sheet.title 
      }, { status: 200 });
    }

    return NextResponse.json({
      // Columna A (ID) y Columna B (Guardias)
      guardias: rows.map(r => ({ 
        id: r._rawData[0] || '',      
        nombre: r._rawData[1] || ''   
      })).filter(g => g.nombre),
      
      // Mapeo por posición según tu Captura 150:
      instalaciones: rows.map(r => r._rawData[3]).filter(Boolean), // Columna D
      supervisores: rows.map(r => r._rawData[4]).filter(Boolean),  // Columna E
      motivos: rows.map(r => r._rawData[5]).filter(Boolean),       // Columna F
      turnos: rows.map(r => r._rawData[6]).filter(Boolean),        // Columna G
    });

  } catch (error) {
    return NextResponse.json({ error: "Fallo de lectura", detalle: error.message }, { status: 500 });
  }
}