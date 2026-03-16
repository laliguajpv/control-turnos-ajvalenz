import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Configuramos la autenticación con tu "Llave"
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // 2. Conectamos con tu Google Sheet usando el ID
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    
    await doc.loadInfo(); 
    const sheet = doc.sheetsByIndex[0]; // La primera pestaña del Excel

    // 3. Agregamos la fila con los datos que vienen del formulario
    // Los nombres aquí deben coincidir con lo que enviaremos desde la App
    await sheet.addRow({
      "id guardia": body.id_guardia,
      "nombre": body.nombre,
      "fecha": body.fecha,
      "turno": body.turno,
      "hora inicio": body.hora_inicio,
      "hora fin": body.hora_fin,
      "total hrs": body.total_hrs,
      "motivo": body.motivo,
      "instalacion": body.instalacion,
      "gestionado por": body.gestionado_por,
      "observaciones": body.observaciones
    });

    return NextResponse.json({ message: 'Turno guardado con éxito' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al conectar con Google Sheets' }, { status: 500 });
  }
}