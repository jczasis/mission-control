export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hola Mundo</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
    <div class="text-center">
        <h1 class="text-6xl font-bold text-white mb-4">👋 ¡Hola Mundo!</h1>
        <p class="text-2xl text-blue-100">Vercel Serverless Function</p>
        <p class="text-sm text-blue-200 mt-6">Timestamp: ${new Date().toLocaleString('es-CL')}</p>
    </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
