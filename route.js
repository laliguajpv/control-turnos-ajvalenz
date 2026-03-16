import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Conexión básica (tal cual la primera vez)
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); 
    
    // 2. Ir a la fija: Buscamos la hoja "CONFIGURACION"
    // Si el nombre falla, cargamos la segunda pestaña (índice 1)
    const sheet = doc.sheetsByTitle['CONFIGURACION'] || doc.sheetsByIndex[1];
    const rows = await sheet.getRows();

    // 3. Retorno simple (sin filtros raros)
    return NextResponse.json({
      guardias: rows.map(r => ({ 
        id: r.get('ID') || '', 
        nombre: r.get('Guardias') || '' 
      })).filter(g => g.nombre),
      instalaciones: rows.map(r => r.get('Instalaciones')).filter(Boolean),
      supervisores: rows.map(r => r.get('Supervisores')).filter(Boolean),
      motivos: rows.map(r => r.get('Motivos')).filter(Boolean),
      turnos: rows.map(r => r.get('Turnos')).filter(Boolean),
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}