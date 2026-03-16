import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // Limpieza profunda de la llave para Vercel
    const privateKey = process.env.GOOGLE_PRIVATE_KEY 
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '').trim() 
      : undefined;

    if (!sheetId || !clientEmail || !privateKey) {
      return NextResponse.json({ error: "Faltan variables de entorno en Vercel" }, { status: 500 });
    }

    const serviceAccountAuth = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo(); 
    
    const sheet = doc.sheetsByTitle['CONFIGURACION'];
    if (!sheet) {
      return NextResponse.json({ error: "No se encontró la pestaña llamada CONFIGURACION" }, { status: 500 });
    }

    const rows = await sheet.getRows();

    return NextResponse.json({
      guardias: rows.map(r => ({ id: r.get('ID') || '', nombre: r.get('Guardias') || '' })).filter(g => g.nombre),
      instalaciones: rows.map(r => r.get('Instalaciones')).filter(Boolean),
      supervisores: rows.map(r => r.get('Supervisores')).filter(Boolean),
      motivos: rows.map(r => r.get('Motivos')).filter(Boolean),
      turnos: rows.map(r => r.get('Turnos')).filter(Boolean),
    });
  } catch (error) {
    // ESTO ES LO IMPORTANTE: Nos dirá el error real (ej: "invalid_grant" o "403 Forbidden")
    return NextResponse.json({ 
      error: "Error de conexión con Google", 
      detalles: error.message 
    }, { status: 500 });
  }
}