const { Client } = require('discord.js');
const client = new Client();
const fetch = require('node-fetch');

let SUMMONER_ID = ''
let SUMMONER_LEVEL = ''
let SUMMONER_NAME = ''

const apFix = '```fix\n'
const apDiff = '```diff\n'
const apIni = '```ini\n'
const apEnd = '```'

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
})

client.on('message', (msg) => {

    if(msg.author === client.user) { return; }

    if(msg.content) {
        
        if(msg.content.includes("!summoner ")) {
            msg.content = msg.content.substr(10)
            GetSummonerIDByName(msg, msg.content)
        }
    }
});

const GetSummonerIDByName = (msg, summonerName) => {

    fetch(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`, {
        method: 'GET',
        headers:
        {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 Edg/81.0.416.72",
            "Accept-Language": "it,it-IT;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://developer.riotgames.com",
            "X-Riot-Token": "RGAPI-e6e8c72a-49a8-4b49-b833-68ed024394f5"
        }})
        .then(resp => {
            return resp.json()})
        .then(data => {
            SUMMONER_ID = data.id;
            SUMMONER_LEVEL = data.summonerLevel;
            SUMMONER_NAME = data.name;

            GetSummonerStats(msg, SUMMONER_ID, SUMMONER_LEVEL, SUMMONER_NAME);
        }).catch((error) => { return console.log(error) })
}

const GetSummonerStats = (msg, summonerID, summonerLevel, summonerName) => {

    fetch(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerID}`, {
        method: 'GET',
        headers:
        {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 Edg/81.0.416.72",
            "Accept-Language": "it,it-IT;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://developer.riotgames.com",
            "X-Riot-Token": "RGAPI-e6e8c72a-49a8-4b49-b833-68ed024394f5"
        }
    }).then(resp => {
        return resp.json()
    }).then(data => {

        let generalInfo = []
        let flex = []
        let solo = []

        let header = `${apIni}[League Of Leagends Summoner Stats]${apEnd}`

        if(data.length === 1) {
            
            for (let [key, value] of Object.entries(data[0])) {
                let elements = `${key}: ${value}`

                if(key === 'leagueId' || 
                    key === 'summonerName' ||
                    key === 'summonerId' ||
                    key === 'veteran' ||
                    key === 'freshBlood') {
                        continue;
                    } else {
                        solo.push(elements.charAt(0).toUpperCase() + elements.slice(1))
                    }
            }

            generalInfo.push(`+ SummonerName: ${data[0].summonerName}`)
            generalInfo.push(`+ SummonerLevel: ${summonerLevel}`)

            let endSolo = `${apFix}${solo.join('\n')}${apEnd}`
            let endGeneralInfo = `${apDiff}${generalInfo.join('\n')}${apEnd}`

            msg.channel.send(header + endGeneralInfo + endSolo)
        }
        
        else if (data.length === 2) {
            
            for (let [key, value] of Object.entries(data[0])) {
                let elements = `${key}: ${value}`

                if(key === 'leagueId' || 
                    key === 'summonerId' ||
                    key === 'summonerName' ||
                    key === 'veteran' ||
                    key === 'freshBlood') {
                        continue;
                    } else {
                        solo.push(elements.charAt(0).toUpperCase() + elements.slice(1))
                    }
            }

            for (let [key, value] of Object.entries(data[1])) {
                let elements = `${key}: ${value}`

                if(key === 'leagueId' || 
                    key === 'summonerId' ||
                    key === 'summonerName' ||
                    key === 'veteran' ||
                    key === 'freshBlood' ||
                    key === 'miniSeries') {
                        continue;
                    } else {
                        flex.push(elements.charAt(0).toUpperCase() + elements.slice(1))
                    }
            } 

            generalInfo.push(`+ SummonerName: ${data[0].summonerName}`)
            generalInfo.push(`+ SummonerLevel: ${summonerLevel}`)

            let endGeneralInfo = `${apDiff}${generalInfo.join('\n')}${apEnd}`
            let endSolo = `${apFix}${solo.join('\n')}${apEnd}`
            let endFlex = `${apFix}${flex.join('\n')}${apEnd}`

            msg.channel.send(header + endGeneralInfo + endSolo + endFlex)

        }

        else if(data.length === 0) {

            generalInfo.push(`+ SummonerName: ${summonerName}`)
            generalInfo.push(`+ SummonerLevel: ${summonerLevel}`)

            let endGeneralInfo = `${apDiff}${generalInfo.join('\n')}${apEnd}`

            let noPlacementFound = `${apDiff}- No placement was found ${apEnd}`
            msg.channel.send(header + endGeneralInfo + noPlacementFound)
        }
        else if (typeof data[0] === 'undefined') {
            let notFound = `${apDiff}- Summoner not found ${apEnd}`
            msg.channel.send(header + notFound)
        }
        
    }).catch((error) => { return console.log(error) })
}

const GetDaataDragonJSON = () => {
    fetch('http://ddragon.leagueoflegends.com/cdn/10.10.3216176/data/en_US/champion.json')
    .then((resp) => {
        return resp.json()
    }).then((data) => {
        console.log(data);
    })
}

client.login(process.env.BOT_TOKEN);