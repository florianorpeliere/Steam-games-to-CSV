const http = require('http');
const fs = require('fs');

const key = '68564EC0A7C5931B2CE0D26BFA20AF77';
const steamId = '76561198010614671';

function getGamesFromSteam(key, steamId) {
  http.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${steamId}&include_appinfo=1&format=json`, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      const response = JSON.parse(data);
      transformToCSV(response.response.games)
    });
  }).on("error", (err) => {
    console.err("Error: " + err.message);
  });
}

function transformToCSV(games) {
  let csvBuffer = 'appid;name;playtime;\n';

  games.sort((gameA, gameB) => gameA.name.localeCompare(gameB.name));

  csvBuffer = games.reduce((acc, game) => {
    csvBuffer += `${game.appid};${game.name};${(game.playtime_forever/60).toFixed(0)}h${game.playtime_forever%60}m;\n`;
    return csvBuffer;
  }, csvBuffer);

  const data = new Uint8Array(Buffer.from(csvBuffer));
  fs.writeFile('games.csv', data, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
}

function run() {
  let error = true;
  let key, steamId;

  if(process.argv[2] && process.argv[3]) {
    for(let i = 2; i < process.argv.length; i++) {
      if(process.argv[i].includes('key=')) {
        key = process.argv[i].slice('key='.length)
      } else if(process.argv[i].includes('steamId=')) {
        steamId = process.argv[i].slice('steamId='.length)
      }
    }

    error = !(key && steamId);
  }

  if(error) {
    console.err('Command is something like : node index.js key=xxx steamId=xxx');
    process.exit(1);
  } else {
    getGamesFromSteam(key, steamId);
  }
}
