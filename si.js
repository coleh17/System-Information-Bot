const request = require('request');
const si = require('systeminformation');
var ps = require('ps-node');

// Start running
async function run() {
    console.log(`SI Script Started`);

    setInterval(async () => {

        // SYSTEM INFORMATION
        var list = [];

        // Get time
        var data = await si.time()
        list.push(`${data.current} @ ${data.timezone}\n`)

        // Get CPU statistics/information
        var data = await si.cpu();
        list.push(`CPU: ${data.speed}GHz | ${data.physicalCores} Cores | ${data.cores} Threads`)
        var data = await si.currentLoad();
        list.push(`\nCurrent Load: ${data.currentload.toFixed(2)}% | Avg. Load: ${data.avgload.toFixed(2)}%`);

        // Get RAM statistics/information
        var data = await si.mem();
        list.push(`\nVirtual Memory: ${Math.round(data.used / 1024 / 1024)}/${Math.round(data.total / 1024 / 1024)}mb (${(((data.used / 1024 / 1024) / (data.total / 1024 / 1024)) * 100).toFixed(2)}%)`);
        list.push(`\nSwap Memory: ${Math.round(data.swapused / 1024 / 1024)}/${Math.round(data.swaptotal / 1024 / 1024)}mb (${(((data.swapused / 1024 / 1024) / (data.swaptotal / 1024 / 1024)) * 100).toFixed(2)}%)`)

        var string = list.join('');

        // STATUS CHECK

        var str = [];
        var online = "";

        // Process lookup with filter 'node' to filter node processes
        ps.lookup({
            command: 'node',
            arguments: '',
        }, function (err, resultList) {
            if (err) {
                throw new Error(err);
            }
            // looping through resulting list of node processes
            resultList.forEach(function (process) {
                if (process) {
                    // push into str array for later use
                    str.push(process.arguments + '');
                }
            });
        });

        // add process information to message
        setTimeout(function () {
            // check each directory a bot is running in to make sure the process list included the node process for bot
            (str.includes('/home/bot1/bot1.js')) ? online = online + "✅ Bot 1 Online!\n" : online = online + "⚠️ Bot 1 Offline!\n";
            (str.includes('/home/bot2/bot2.js')) ? online = online + "✅ Bot 2 Online!\n" : online = online + "⚠️ Bot 2 Offline!\n";
            (str.includes('/home/bot3/bot2.js')) ? online = online + "✅ Bot 3 Online!\n" : online = online + "⚠️ Bot 3 Offline!\n";

            string = string + `\n\n` + online;

            // Make post request to the webhook on Discord
            request.post('WEBHOOK_URL_HERE', {
                form: {
                    content: `\`\`\`${string}\`\`\``
                },
                headers: {
                    'Conent-Type': 'application/x-www-form-urlencoded'
                }
            }, (err, res, body) => {
                if (err) console.error(err);
            });

        }, 4000)

    }, 7200000)

}

run();