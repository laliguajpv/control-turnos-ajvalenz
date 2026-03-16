import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Limpiador automático de llaves para evitar errores de formato
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
    const privateKey = rawKey.replace(/\\n/g, '\n').replace(/"/g, '').trim();

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim(),
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID?.trim(), serviceAccountAuth);
    await doc.loadInfo(); 
    
    // Busca la hoja CONFIGURACION
    const sheet = doc.sheetsByTitle['CONFIGURACION'] || doc.sheetsByIndex[1];
    const rows = await sheet.getRows();

    return NextResponse.json({
      guardias: rows.map(r => ({ 
        id: r._rawData[0] || '',      
        nombre: r._rawData[1] || ''   
      })).filter(g => g.nombre),
      instalaciones: rows.map(r => r._rawData[3]).filter(Boolean),
      supervisores: rows.map(r => r._rawData[4]).filter(Boolean),
      motivos: rows.map(r => r._rawData[5]).filter(Boolean),
      turnos: rows.map(r => r._rawData[6]).filter(Boolean),
    });
  } catch (error) {
    return NextResponse.json({ error: "Error de conexión", detalle: error.message }, { status: 500 });
  }
}