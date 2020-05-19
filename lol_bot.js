const { Client } = require('discord.js');
const client = new Client();
const fetch = require('node-fetch');

let SUMMONER_ID = ''

const apFix = '```fix\n'
const apDiff = '```diff\n'
const apIni = '```ini\n'
const apEnd = '```'

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

})

client.on('message', (msg) => {
    if(msg.author === client.user)
    {
        return
    }

    if(msg.content === msg.content) {
        
        if(msg.content.includes("!summoner ")) {
            msg.content = msg.content.substr(10)
            GetSummonerIDByName(msg, msg.content)
        }
    }
});

const ProcessedCommand = (msg) => {
    let fullCommand = msg.content.substr(4) // Remove the leading exclamation mark
    let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
    let primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

    console.log("Command received: " + primaryCommand)
    console.log("Arguments: " + arguments) // There may not be any arguments

    if (primaryCommand == "help") {
        helpCommand(arguments, msg)
    } else if (primaryCommand === "multiply") {
        multiplyCommand(arguments, msg)
    } else {
        msg.channel.send("I don't understand the command. Try `!help` or `!multiply`")
    }
}

const GetSummonerIDByName = (msg, summonerName) => {

    fetch(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`, {
        method: 'GET',
        headers:
        {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 Edg/81.0.416.72",
            "Accept-Language": "it,it-IT;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://developer.riotgames.com",
            "X-Riot-Token": "RGAPI-0d8c4a08-f307-453b-a0b8-15c39c4a2c85"
        }})
        .then(resp => {
            return resp.json()})
        .then(data => {
            SUMMONER_ID = data.id;
            console.log(SUMMONER_ID)
            GetSummonerStats(msg, SUMMONER_ID);
        }).catch((error) => { return console.log(error) })
}

const GetSummonerStats = (msg, summonerID) => {

    fetch(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerID}`, {
        method: 'GET',
        headers:
        {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 Edg/81.0.416.72",
            "Accept-Language": "it,it-IT;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://developer.riotgames.com",
            "X-Riot-Token": "RGAPI-0d8c4a08-f307-453b-a0b8-15c39c4a2c85"
        }
    }).then(resp => {
        return resp.json()
    }).then(data => {

        let flex = []
        let solo = []

        let header = `${apIni}[League Of Leagends Summoner Stats]${apEnd}`

        if(data.length === 1) {
            
            for (let [key, value] of Object.entries(data[0])) {
                let elements = `${key}: ${value}`

                if(key === 'leagueId' || 
                    key === 'summonerId' ||
                    key === 'veteran' ||
                    key === 'freshBlood') {
                        continue;
                    } else {
                        solo.push(elements.charAt(0).toUpperCase() + elements.slice(1))
                    }
            }

            let endSolo = `${apFix}${solo.join('\n')}${apEnd}`

            msg.channel.send(header + endSolo)
        }
        
        else if (data.length === 2) {
            
            for (let [key, value] of Object.entries(data[0])) {
                let elements = `${key}: ${value}`

                if(key === 'leagueId' || 
                    key === 'summonerId' ||
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
                    key === 'veteran' ||
                    key === 'freshBlood' ||
                    key === 'miniSeries') {
                        continue;
                    } else {
                        flex.push(elements.charAt(0).toUpperCase() + elements.slice(1))
                    }
            } 

            let endSolo = `${apFix}${solo.join('\n')}${apEnd}`
            let endFlex = `${apFix}${flex.join('\n')}${apEnd}`

            msg.channel.send(header + endSolo + endFlex)

        }

        else if(data.length === 0) { 
            let notFound = `${apDiff}- No placement was found ${apEnd}`
            msg.channel.send(notFound)
        }
        else if (typeof data[0] === 'undefined') {
            let notFound = `${apDiff}- Summoner not found ${apEnd}`
            msg.channel.send(notFound)
        }
        
    }).catch((error) => { return console.log(error) })
}

client.login(process.env.BOT_TOKEN);