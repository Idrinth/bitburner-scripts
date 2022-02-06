/**
 * @param {NS} ns
 **/
export async function main(ns) {
    ns.disableLog('ALL');
	const max = ns.getPurchasedServerLimit();
    let power = 3;
    while (power <= 20) {
        for (let i=0; i < max; i++) {
            const ram = Math.pow(2, power);
            if (ns.serverExists('butler'+i) && ram <= ns.getServerMaxRam('butler'+i)) {
                continue;
            }
            var cost = ns.getPurchasedServerCost(ram);
            while (cost > ns.getServerMoneyAvailable('home')) {
                await ns.sleep(1000);
            }
            if (ns.serverExists('butler'+i)) {
                ns.deleteServer('butler'+i);
                ns.toast('Upgrading butler-' + i);
            } else {
                ns.toast('Buying new butler-' + i);
            }
            ns.purchaseServer('butler-' + i, ram);
            const js = ns.ls('home', '.js');
            for (var pos = js.length - 1; pos >= 0; pos--) {
                await ns.scp(js[pos], 'home', 'butler-' + i);
            }
            ns.exec('start.js', 'butler-' + i, 1);
            i = ns.getPurchasedServers().length
        }
        power++;
    }
}
