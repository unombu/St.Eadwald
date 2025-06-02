exports.handler = async function(event, context) {
    const WORDS = [
        "LINDO", "CUTIE", "TALOS", "SONIC", "ALIEN", "BESOS", "CALVO", "VERDE", "JUEGO",
        "PLUTO", "MOMMY", "PLEASE"
    ];

    let index = event.queryStringParameters.i;

    let word = WORDS[index];

    return {
        statusCode: 200, // Código de estado HTTP 200 (OK)
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // ¡Importante para permitir peticiones desde tu frontend!
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ word: word , i : index }) // Envía la palabra como un objeto JSON
    };
}