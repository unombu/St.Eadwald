exports.handler = async function(event, context) {
    const WORDS = {
        0 : {word : "LINDO"}, 
        1 : {word : "CUTIE"},
        587 : {word : "TALOS"},
        71 : {word : "SONIC"},
        27 : {word : "ALIEN"},
        2 : {word : "BESOS"},
        3 : {word : "CALVO"},
        4 : {word : "VERDE"},
        5 : {word : "JUEGO"},
        9 : {word : "PLUTO"},
        10 : {word : "MOMMY"},
        11 : {word : "DADDY"},
        66 : {word : "SILLA"}
    };

    let index = event.queryStringParameters.i;

    let word = WORDS[index];

    return {
        statusCode: 200, // Código de estado HTTP 200 (OK)
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // ¡Importante para permitir peticiones desde tu frontend!
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ word: word.word}) // Envía la palabra como un objeto JSON
    };
}