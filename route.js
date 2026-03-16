import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ESTO CORRIGE EL ERROR DE VERCEL (Limpia la llave de saltos de línea raros)
    const privateKey = process.env.GOOGLE_PRIVATE_KEY 
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '') 
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

    const config = {
      guardias: rows.map(r => ({ 
        id: r.get('ID') || '', // Traemos el ID de la columna A
        nombre: r.get('Guardias') || '' 
      })).filter(g => g.nombre),
      instalaciones: rows.map(r => r.get('Instalaciones')).filter(Boolean),
      supervisores: rows.map(r => r.get('Supervisores')).filter(Boolean),
      motivos: rows.map(r => r.get('Motivos')).filter(Boolean),
      turnos: rows.map(r => r.get('Turnos')).filter(Boolean),
    };

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}