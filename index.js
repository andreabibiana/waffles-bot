require("dotenv").config()

const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs');

const alexaSongs = [
    "Despacito (ft. Justin Bieber)",
    "Wham! - Last Christmas (1 hour)",
    "PSY - Gangnam Style", 
    "Despacito 2",
    "Despacito 3 (ft. Elon Musk)",
    "Despacito Number 5"
]

const alexaShuffle = () => {
    for (let i = alexaSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
       [alexaSongs[i], alexaSongs[j]] = [alexaSongs[j], alexaSongs[i]];
    }
    return alexaSongs[0];
}
const extractPoints = (data) => {
    const pointsObject = {}
    if(data) {
        data.split("\n").map(line=> {
            if(line !== "") {
                const lineToArray = line.split(" ");
                const userId = lineToArray[0];
                const userName = lineToArray[1];
                const points = parseInt(lineToArray[2]);
                pointsObject[userId] = {
                    user:userName,
                    points: points
                }
            }
        });
    }
    return pointsObject;
}
const formatPointsForSaving = (object) => {
    let save = "";
    for(let id in object) {
        if(id) save = save.concat(`${id} ${object[id].user} ${object[id].points}\n`);
    }
    return save;
}

client.on('ready', () => {
    console.log('🧇 Waffles are served.')
})

client.on('message',msg => {
    if(msg.content.toLowerCase().includes("alexa")||msg.content.toLowerCase().includes("so sad")) {
        const song = alexaShuffle();
        msg.channel.send(`ɴᴏᴡ ᴘʟᴀʏɪɴɢ: ${song}\n───────────────⚪───\n◄◄⠀▐▐ ⠀►►⠀⠀ ⠀ 2:57 / 3:48 ⠀ ───○ 🔊`);
    }
    if(msg.content.toLowerCase().includes("alakesad")) {
        msg.channel.send("https://cdn.discordapp.com/attachments/689868833854717963/783707644825042948/FB_IMG_1600092145587.jpg");
    }
    if(msg.content.startsWith("!points")) {
        fs.readFile('points.txt', (err, data) => { 
            if(err) {
                msg.channel.send("Ha habido un error.");
                return;
            }
            const points = extractPoints(data.toString());
            let pointsAddedMessages = "";
            if(msg.mentions) {
                msg.mentions.users.map((user) => {
                    const userTag = `${user.username}#${user.discriminator}`;
                    if(user.id in points) {
                        points[user.id] = {
                            user: userTag,
                            points: points[user.id].points+10
                        }
                    } else {
                        points[user.id] = {
                            user: userTag,
                            points: 10
                        }
                    };
                    pointsAddedMessages = pointsAddedMessages.concat(`10 puntos para **${userTag}**\n`);
                });
                if([...msg.mentions.users.values()].length > 0) {
                    pointsAddedMessages = pointsAddedMessages.concat(`-----------\n`);
                }
            }
            fs.writeFile('points.txt', formatPointsForSaving(points), function (err) {
                if(err) {
                    msg.channel.send("Ha habido un error.");
                    return;
                }
                let finalMessage = pointsAddedMessages.concat(`Tabla de puntuaciones:`);
                for(let record in points) {
                    finalMessage = finalMessage.concat(`\n${points[record].user}: ${points[record].points} puntos`);
                }
                if(Object.keys(points).length == 0) {
                    finalMessage = finalMessage.concat(`\n*Nadie tiene puntos.*`)
                }
                msg.channel.send(finalMessage);
            });
        }) 
    }
})
client.login(process.env.DISCORD_BOT_TOKEN);